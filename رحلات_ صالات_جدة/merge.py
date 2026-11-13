"""merge.py — دمج رحلات المواقع ومقارنتها ببعضها.

القواعد كما حدّدها صاحب المشروع:
- إن اتفقت المواقع على معلومة سُجّلت مرة واحدة بلا تكرار.
- إن اختلفت سُجّلت قيمة كل موقع، ويختار صاحب المشروع الصحيحة منها
  بالضغط عليها، فتبقى وتظهر هي.

تفاصيل لازمة:
- الرحلة الواحدة تُعرف بأي رقم من أرقامها داخل يومها، فالرحلة المشتركة
  يذكرها موقع برقم وموقع آخر برقم آخر، ويجمعها رقم مشترك.
- لا تدخل المقارنة إلا قيم المواقع التي تعرض الرحلة الآن. فإكسيجو مثلًا
  يعرض نافذة ساعات قريبة، وحين تخرج الرحلة منها لا تُقارن قيمته القديمة.
- رحلة لم يعد يعرضها أي موقع لا تُحذف، وتبقى بآخر ما عُرف عنها مع علامة.
- اختيار صاحب المشروع يبقى ما دام أحد المواقع يعرض القيمة المختارة. فإن
  لم يعد أي موقع يعرضها، عادت المعلومة مختلفًا عليها ليختار من جديد.
"""

from __future__ import annotations

import datetime
from typing import Any

import common

# البوابة أُلغيت من العرض والمقارنة بأمر المالك ٢٠٢٦-١٠-٠٣، فلا يُحسب خلاف
# على معلومة لا تظهر. وتبقى محفوظة فيما يجلبه الجامع.
FIELDS = ("terminal", "sched", "est", "dest", "status")
FIELD_NAMES = {
    "terminal": "الصالة",
    "sched": "المجدول",
    "est": "المتوقع",
    "dest": "الوجهة",
    "status": "الحالة",
}
SOURCE_ORDER = ("jeddah", "kupi", "aerodatabox")
# مصدر يُجلب بضع مرات في اليوم: الحالة والمتوقع منه يتقادمان، فلا يدخلان المقارنة
# إذا مضى على جلبهما أكثر من هذه الساعات. وتبقى الصالة والمجدول والوجهة.
SLOW_SOURCES = {"aerodatabox": 9}
AGING_FIELDS = ("status", "est")
HISTORY_ORDER = SOURCE_ORDER + common.STOPPED_SOURCES
# صالة شركة الطيران بقرار صاحب المشروع (٢٠٢٦-١٠-٠٥): تغلب ما تقوله المواقع،
# ولا يغلبها إلا ما كُتب باليد.
AIRLINE_TERMINALS = {"PC": "4", "3T": "H"}
DEPARTED = "أقلعت"
# حالتان لا تصير الرحلة بعدهما «أقلعت» تلقائيًا حين يحين موعدها.
NOT_DEPARTING = ("ألغيت", "تحوّلت")


def choice_key(day: str, number: str, field: str) -> str:
    """مفتاح اختيار صاحب المشروع لمعلومة واحدة من رحلة واحدة."""
    return f"{day}|{number}|{field}"


class Groups:
    """يجمع الأرقام المترابطة في رحلة واحدة (الرحلات المشتركة)."""

    def __init__(self) -> None:
        self.parent: dict[str, str] = {}

    def find(self, number: str) -> str:
        self.parent.setdefault(number, number)
        while self.parent[number] != number:
            self.parent[number] = self.parent[self.parent[number]]
            number = self.parent[number]
        return number

    def join(self, numbers: list) -> None:
        first = self.find(numbers[0])
        for number in numbers[1:]:
            self.parent[self.find(number)] = first


def gather(state: dict, day: str) -> tuple:
    """سجلات اليوم من كل موقع: ما رُئي، ومفاتيح ما يُعرض الآن، بلا المحذوفة."""
    removed = set(state.get("removed", {}).get(day, []))
    seen = {
        source: {key: row for key, row in records.items()
                 if not removed & set(row["nums"])}
        for source, records in state.get("seen", {}).get(day, {}).items()
    }
    live: dict = {}
    for source in SOURCE_ORDER:
        rows = state.get("current", {}).get(source, {}).get(day)
        if rows is not None:
            live[source] = {"|".join(row["nums"]) for row in rows}
    return seen, live


def build_groups(seen: dict) -> tuple:
    """يربط الأرقام ويعيد: الأرقام لكل رحلة، وسجلات كل موقع لكل رحلة."""
    groups = Groups()
    for records in seen.values():
        for row in records.values():
            groups.join(row["nums"])
    numbers: dict = {}
    members: dict = {}
    for source, records in seen.items():
        for key, row in records.items():
            root = groups.find(row["nums"][0])
            numbers.setdefault(root, [])
            for number in row["nums"]:
                if number not in numbers[root]:
                    numbers[root].append(number)
            members.setdefault(root, {}).setdefault(source, []).append((key, row))
    return numbers, members


def pick_record(entries: list, live_keys: set) -> tuple:
    """من سجلات موقع واحد للرحلة: المعروض الآن أولًا، ثم الأحدث رؤية."""
    shown = [row for key, row in entries if key in live_keys]
    pool = shown or [row for _, row in entries]
    latest = max(pool, key=lambda row: row.get("seen") or "")
    return latest, bool(shown)


def field_result(day: str, numbers: list, field: str,
                 values: dict, choices: dict, operator: str = "") -> dict:
    """نتيجة معلومة واحدة: متفق عليها، أو مختارة، أو مختلف عليها."""
    distinct = sorted({value for value in values.values() if value is not None})
    result: dict[str, Any] = {"values": values, "value": None,
                              "conflict": False, "chosen": False, "manual": False}
    # القيمة المكتوبة باليد تغلب دائمًا، ولو اتفقت المواقع، حتى يختار أحد
    # غيرها (قرار المالك ٢٠٢٦-١٠-٠٣). فهي ليست من موقع حتى تسقط بتغيّره.
    for number in numbers:
        picked = choices.get(choice_key(day, number, field))
        if picked and picked.get("source") == "manual" and picked.get("value"):
            result.update(value=picked["value"], chosen=True, manual=True)
            return result
    ruled = AIRLINE_TERMINALS.get(operator[:2]) if field == "terminal" else None
    if ruled:
        result.update(value=ruled, chosen=True, rule=True)
        return result
    if len(distinct) <= 1:
        result["value"] = distinct[0] if distinct else None
        return result
    for number in numbers:
        picked = choices.get(choice_key(day, number, field))
        if picked and picked.get("value") in distinct:
            result["value"] = picked["value"]
            result["chosen"] = True
            return result
    result["conflict"] = True
    return result


def operating_number(picked: dict, numbers: list) -> str:
    """رقم الشركة المشغّلة: الأول في صف كوبي المشترك، فهو من حقل «الناقل المشغّل»،
    ثم الأول في صف جدة المشترك (طابق كوبي في ١٥٠ رحلة من ١٥٠، قيس ٢٠٢٦-١٠-٠٥).
    فرقم مشترك تبيعه شركة على رحلة غيرها لا ينقلها إلى صالة شركته."""
    for source in ("kupi", "jeddah"):
        if source in picked and len(picked[source][0]["nums"]) > 1:
            return picked[source][0]["nums"][0]
    return numbers[0]


def field_times(result: dict) -> list:
    """الوقت المعتمد للمعلومة، أو كل أوقات المواقع إن اختلفت."""
    if result["value"]:
        return [result["value"]]
    return [value for value in result["values"].values() if value]


def departure_moment(day: str, flight: dict):
    """أبعد وقت إقلاع ممكن للرحلة بتوقيت جدة، أو لا شيء إن لم يُعرف.
    هو المتوقع إن عُرف وإلا المجدول، وأبعد الأوقات عند الخلاف."""
    fields = flight["fields"]
    clocks = field_times(fields["est"]) or field_times(fields["sched"])
    scheduled = field_times(fields["sched"])
    if not clocks:
        return None
    base = datetime.date.fromisoformat(day)
    moments = []
    for clock in clocks:
        try:
            hours, minutes = (int(part) for part in clock.split(":"))
        except ValueError:
            return None
        moment = datetime.datetime.combine(base, datetime.time(hours, minutes),
                                           tzinfo=common.RIYADH)
        # رحلة مجدولة قبل منتصف الليل تأخرت إلى ما بعده: وقتها في اليوم التالي.
        if scheduled and min(scheduled) >= "18:00" and clock < "06:00":
            moment += datetime.timedelta(days=1)
        moments.append(moment)
    return max(moments)


def depart_on_time(day: str, flight: dict, now: Any) -> None:
    """إذا بلغ العداد ٠٠:٠٠ صارت الحالة «أقلعت» تلقائيًا (أمر المالك ٢٠٢٦-١٠-٠٥).
    إلا رحلة ألغاها أو حوّلها موقع، فلا يُكتب عليها إقلاع لم يقع."""
    status = flight["fields"]["status"]
    if status.get("manual") or status["value"] == DEPARTED:
        return
    said = set(status["values"].values()) | {status["value"]}
    if said & set(NOT_DEPARTING):
        return
    moment = departure_moment(day, flight)
    if moment is not None and now >= moment:
        status.update(value=DEPARTED, conflict=False, chosen=False, auto=True)


def flight_terminals(result: dict) -> set:
    """الصالات التي تظهر فيها الرحلة: صالتها، أو كل صالة يدّعيها موقع."""
    if result["value"] is not None:
        return {result["value"]}
    return {value for value in result["values"].values() if value is not None}


def source_value(source: str, row: dict, field: str, now: Any) -> Any:
    """قيمة الموقع للمعلومة، أو لا شيء إن كانت حالة أو متوقعًا قديمًا من مصدر بطيء."""
    hours = SLOW_SOURCES.get(source)
    if hours and field in AGING_FIELDS:
        oldest = (now - datetime.timedelta(hours=hours)).strftime("%Y-%m-%d %H:%M:%S")
        if (row.get("seen") or "") < oldest:
            return None
    return row.get(field)


def merge_day(state: dict, day: str, choices: dict, now: Any = None) -> dict:
    """رحلات يوم واحد بعد الدمج، مقسومة على الصالات الثلاث."""
    seen, live = gather(state, day)
    numbers, members = build_groups(seen)
    now = now or common.now()
    by_terminal: dict = {terminal: [] for terminal in common.WANTED}
    no_terminal = 0
    for root, per_source in members.items():
        picked = {}
        for source, entries in per_source.items():
            row, shown = pick_record(entries, live.get(source, set()))
            picked[source] = (row, shown)
        showing = [s for s in SOURCE_ORDER if s in picked and picked[s][1]]
        compared = showing or [s for s in HISTORY_ORDER if s in picked]
        flight: dict[str, Any] = {
            "nums": numbers[root],
            "showing": showing,
            "gone": not showing,
            "counter": next((picked[s][0].get("counter") for s in compared
                             if picked[s][0].get("counter")), None),
            "fields": {},
        }
        for field in FIELDS:
            values = {s: source_value(s, picked[s][0], field, now) for s in compared}
            flight["fields"][field] = field_result(day, numbers[root], field, values,
                                                   choices, operating_number(picked, numbers[root]))
        depart_on_time(day, flight, now)
        places = flight_terminals(flight["fields"]["terminal"])
        if not places:
            no_terminal += 1
        for terminal in places & set(common.WANTED):
            by_terminal[terminal].append(flight)
    for flights in by_terminal.values():
        # الرحلات المتساوية في الوقت برقمها الأول، فيتطابق ترتيب الطرفية والجوال:
        # القاعدة لا تحفظ ترتيب وصول الرحلات من المواقع (٢٠٢٦-١٠-٠٣).
        flights.sort(key=lambda flight: (sort_time(flight), flight["nums"][0]))
    return {"by_terminal": by_terminal, "no_terminal": no_terminal}


def sort_time(flight: dict) -> str:
    """ترتيب الرحلات بالوقت المجدول، وعند الخلاف بأبكر قيمة."""
    result = flight["fields"]["sched"]
    if result["value"]:
        return result["value"]
    candidates = [v for v in result["values"].values() if v]
    return min(candidates) if candidates else "99:99"


def conflicts(flight: dict) -> list:
    """أسماء المعلومات المختلف عليها في رحلة."""
    return [field for field in FIELDS if flight["fields"][field]["conflict"]]
