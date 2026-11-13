"""collector.py — يجمع رحلات المغادرة من الموقعين العاملين بلا توقف.

يعمل في الخلفية ولا يعرض شيئًا. بعد كل جلب ناجح يكتب ملف الحالة، وتقرؤه
شاشة الرحلات.

ملف الحالة يحفظ أمرين لكل موقع:
- «الحالي»: ما يعرضه الموقع الآن لكل يوم. هذا وحده يدخل في المقارنة.
- «ما رُئي»: كل رحلة ظهرت في الموقع اليوم، ولو اختفت منه بعد ذلك. فلا
  تُحذف رحلة لأنها خرجت من نافذة موقع، ولا يُفترض أنها أقلعت.

وتيرة السؤال: جدة إيربورت وكوبي كل عشر دقائق لليوم والغد. وإيرو داتا بوكس
يوم كامل بطلبين في ثلاث جولات ثابتة (٠٠:٠٠ و٠٨:٠٠ و١٦:٠٠ بتوقيت جدة)، لأن رصيده
٤٠٠ وحدة في الشهر، ويتوقف قبل نفاده. وإكسيجو أُوقف بأمر المالك في ٢٠٢٦-١٠-٠٥
لأن شروطه تمنع الجمع الآلي. ولا يُطلب ما بعد الغد، لأن
المواقع لا تذكر الصالة فيه، وقد قيس ذلك في ٢٠٢٦-١٠-٠٣.

ونسخة واحدة فقط تعمل في وقت واحد، بقفل على ملف.
"""

from __future__ import annotations

import datetime
import fcntl
import sys
import time
from collections.abc import Callable

import cleanup
import cloud
import common
import kaya_bridge
import sources

EVERY = {"jeddah": 600, "kupi": 600}
RETRY_AFTER_ERROR = 120
AERO = "aerodatabox"
AERO_SLOTS = (0, 8, 16)
# وحدات لا تُصرف: ٤٠٠ − ٢٠ = ٣٨٠ وحدة = ١٩٠ طلبًا، والجولات تحتاج ١٨٠ في الشهر.
AERO_RESERVE = 20


class BudgetExhausted(Exception):
    """رصيد إيرو داتا بوكس بلغ الحد، فلا يُطلب حتى يتجدد الشهر."""
CLOUD_EVERY = 30
KEEP_DAYS_BEFORE = 1


def number_key(row: dict) -> str:
    """مفتاح الرحلة داخل يومها: أرقامها مجتمعة."""
    return "|".join(row["nums"])


def empty_state() -> dict:
    """حالة جديدة لا شيء فيها."""
    return {"updated": None, "sources": {}, "current": {}, "seen": {}, "removed": {}}


def store(state: dict, source: str, rows_by_day: dict) -> None:
    """يحفظ نتيجة جلب ناجح في الحالي وفي ما رُئي."""
    moment = common.stamp()
    current = state["current"].setdefault(source, {})
    for day, all_rows in rows_by_day.items():
        # الرحلة المحذوفة لا تُحفظ من جديد وإن ظل الموقع يعرضها.
        removed = set(state.get("removed", {}).get(day, []))
        rows = [row for row in all_rows if not removed & set(row["nums"])]
        current[day] = rows
        seen = state["seen"].setdefault(day, {}).setdefault(source, {})
        for row in rows:
            seen[number_key(row)] = dict(row, seen=moment)


def prune(state: dict) -> None:
    """يحذف من الحالة الأيام التي مضت، ويبقي أمس للرجوع إليه."""
    oldest = (common.today() - datetime.timedelta(days=KEEP_DAYS_BEFORE)).isoformat()
    for day in [d for d in state["seen"] if d < oldest]:
        del state["seen"][day]
    for days in state["current"].values():
        for day in [d for d in days if d < oldest]:
            del days[day]


def by_day(rows: list) -> dict:
    """يقسم السجلات حسب تاريخها."""
    grouped: dict = {}
    for row in rows:
        if row["date"]:
            grouped.setdefault(row["date"], []).append(row)
    return grouped


def pull_jeddah() -> dict:
    """جدة إيربورت: اليوم والغد، كلٌّ بتاريخه المكتوب في الصفحة."""
    result = {}
    for tomorrow in (False, True):
        day, rows = sources.fetch_jeddah(tomorrow)
        if day:
            result[day] = rows
    return result


def pull_kupi() -> dict:
    """كوبي: اليوم والغد بتاريخ جدة."""
    first = common.today()
    days = (first, first + datetime.timedelta(days=1))
    return {day.isoformat(): sources.fetch_kupi(day.isoformat()) for day in days}


def aero_slot_start(at: datetime.datetime) -> datetime.datetime:
    """بداية الجولة التي يقع فيها الوقت المعطى."""
    hour = max(h for h in AERO_SLOTS if h <= at.hour)
    return at.replace(hour=hour, minute=0, second=0, microsecond=0)


def aero_seconds_to_next(at: datetime.datetime) -> int:
    """الثواني حتى الجولة التالية."""
    start = aero_slot_start(at)
    later = [h for h in AERO_SLOTS if h > start.hour]
    if later:
        following = start.replace(hour=later[0])
    else:
        following = start.replace(hour=AERO_SLOTS[0]) + datetime.timedelta(days=1)
    return int((following - at).total_seconds())


def aero_initial_delay(info: dict, at: datetime.datetime) -> int:
    """عند بدء التشغيل: لا يُعاد جلب جولة جُلبت، كي لا تصرف إعادة التشغيل الرصيد."""
    done = info.get("ok")
    if done and done >= aero_slot_start(at).strftime("%Y-%m-%d %H:%M:%S"):
        return aero_seconds_to_next(at)
    return 0


def pull_aerodatabox(info: dict) -> dict:
    """إيرو داتا بوكس: اليوم كاملًا، ما دام في الرصيد أكثر من الحد."""
    left = info.get("units_left")
    if left is not None and left <= AERO_RESERVE:
        raise BudgetExhausted(f"بقي {left} وحدة، والحد {AERO_RESERVE}")
    rows, left = sources.fetch_aerodatabox(common.today().isoformat())
    if left is not None:
        info["units_left"] = left
    return by_day(rows)


PULLERS: dict[str, Callable[[dict], dict]] = {
    "jeddah": lambda _info: pull_jeddah(),
    "kupi": lambda _info: pull_kupi(),
    AERO: pull_aerodatabox,
}


def next_delay(source: str, failed: bool) -> int:
    """الثواني حتى الجلب التالي: إيرو داتا بوكس في جولته التالية دائمًا."""
    if source == AERO:
        return aero_seconds_to_next(common.now())
    return RETRY_AFTER_ERROR if failed else EVERY[source]


def retire(state: dict) -> None:
    """يزيل حال الموقع الموقوف وجلبه الحالي، ويُبقي ما رُئي منه، ويسجّل ذلك."""
    for source in common.STOPPED_SOURCES:
        status = state["sources"].pop(source, None)
        current = state["current"].pop(source, None)
        if status is not None or current is not None:
            common.log("إيقاف موقع", {"الموقع": source, "آخر حال": status,
                                      "أيام الجلب الحالي": sorted(current or {})})


def run_one(state: dict, source: str) -> int:
    """جلب واحد من موقع واحد، ويعيد عدد الثواني حتى الجلب التالي."""
    info = state["sources"].setdefault(source, {})
    info["tried"] = common.stamp()
    try:
        rows_by_day = PULLERS[source](info)
    except BudgetExhausted as problem:
        info["error"] = f"نفاد الرصيد: {problem}"
        common.log("نفاد الرصيد", {"الموقع": source, "العلة": str(problem)})
        return next_delay(source, failed=True)
    except Exception as problem:  # noqa: BLE001 — أي عطل في موقع لا يوقف بقية المواقع
        info["error"] = f"{type(problem).__name__}: {problem}"[:300]
        common.log("تعذّر الجلب", {"الموقع": source, "العلة": info["error"]})
        return next_delay(source, failed=True)
    store(state, source, rows_by_day)
    info["ok"] = common.stamp()
    info["error"] = None
    counts = {day: len(rows) for day, rows in rows_by_day.items()}
    details: dict = {"الموقع": source, "الرحلات": counts}
    if "units_left" in info:
        details["الوحدات الباقية"] = info["units_left"]
    common.log("جلب ناجح", details)
    return next_delay(source, failed=False)


def run_cloud(uploader: cloud.Uploader, state: dict,
              bridge: kaya_bridge.KayaBridge | None = None) -> None:
    """مزامنة الاختيارات ثم رفع ما تغيّر، ثم الترحيل إلى كايا. عطل القاعدة لا يوقف الجمع."""
    try:
        choices = uploader.sync_choices(common.CHOICES_FILE)
        first = common.today()
        days = [first.isoformat(), (first + datetime.timedelta(days=1)).isoformat()]
        sent = uploader.push(state, choices, days, int(time.time() * 1000))
        changed = sum(1 for key in sent if key.startswith("days/"))
        if changed:
            common.log("رفع ناجح", {"عقد متغيّرة": changed})
    except Exception as problem:  # noqa: BLE001 — أي عطل في الرفع لا يوقف الجمع
        common.log("تعذّر الرفع", f"{type(problem).__name__}: {problem}"[:300])
        return
    if bridge is None:
        return
    # الترحيل بالبيانات نفسها التي رُفعت للتو إلى LIVE FLT، فلا يرى كايا غير ما يراه الجوال.
    try:
        bridge.run(state, choices, days, int(time.time() * 1000))
    except Exception as problem:  # noqa: BLE001 — عطل الترحيل لا يوقف الجمع ولا الرفع
        common.log("تعذّر الترحيل إلى كايا", f"{type(problem).__name__}: {problem}"[:300])


def hold_lock():
    """يمنع تشغيل نسختين معًا، ويُبقي القفل ما دام البرنامج يعمل."""
    handle = open(common.LOCK_FILE, "w")  # noqa: SIM115 — يبقى مفتوحًا ليبقى القفل
    try:
        fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        print("الجامع يعمل بالفعل في نسخة أخرى.")
        sys.exit(0)
    return handle


def main() -> None:
    """الحلقة الدائمة: كل موقع في موعده، والحالة تُكتب بعد كل جلب."""
    _lock = hold_lock()  # يبقى مفتوحًا طوال عمل البرنامج
    state = common.read_json(common.STATE_FILE, empty_state())
    retire(state)
    due = {source: 0.0 for source in PULLERS}
    due[AERO] = time.monotonic() + aero_initial_delay(state["sources"].get(AERO, {}), common.now())
    session = sources.requests.Session()
    uploader = cloud.connect(session)
    bridge = kaya_bridge.connect(uploader, session)
    cloud_due = 0.0
    common.log("بدء الجامع", {"الوتيرة بالثواني": EVERY, "جولات إيرو داتا بوكس": AERO_SLOTS})
    while True:
        for source in PULLERS:
            if time.monotonic() >= due[source]:
                due[source] = time.monotonic() + run_one(state, source)
                prune(state)
                choices = common.read_json(common.CHOICES_FILE, {})
                cleanup.sweep(state, choices, common.now())
                state["updated"] = common.stamp()
                common.write_json(common.STATE_FILE, state)
        if uploader and time.monotonic() >= cloud_due:
            cloud_due = time.monotonic() + CLOUD_EVERY
            run_cloud(uploader, state, bridge)
        time.sleep(5)


if __name__ == "__main__":
    main()
