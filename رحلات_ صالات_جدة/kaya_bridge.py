"""kaya_bridge.py — ترحيل صالات LIVE FLT إلى تيوب «كايا» في قاعدة صالة الحج الرئيسة.

أمر صاحب المشروع ٢٠٢٦-١٠-٠٥ (الخطة `~/.claude/plans/elegant-napping-bird.md`):
زرّ «ترحيل البيانات» في الجوال يربط صالة، والحاسوب ينقل رحلاتها إلى قائمة
الصالة نفسها في كايا، ثم يبقى ينقل كل تغيير، لليوم والغد ولكل يوم جديد.

الطلب من الجوال في قاعدة LIVE FLT (مفتوحة لأي أحد، فكل قيمة تُفحص هنا):
- `jed/kaya/links/{N|1|4}` = `{on, at}` (بلا اسم من ضغط: القاعدة مفتوحة)؛ ويكتب هذا البرنامج تحته `r` نتيجة
  الطلب، و`{on:false, stopped:"deleted"}` إذا حُذفت كل رحلاته من كايا.
- `jed/kaya/picks/{day}/{key}` = (مفتاح الرحلة في LIVE FLT، وهو أول أرقامها) `{t:"sched"|"est", est}` الوقت الذي اختاره
  صاحب المشروع، والمتوقع الذي رآه حين اختار.

ما يُكتب في كايا هو سجلّ الرحلة المعتاد لا غير (لا حقل جديد، قراره): رقم
الرحلة، والناقل، والوجهة، ووقت واحد، واليوم، والصالة، ولحظة الإقلاع.
ولا يحذف هذا البرنامج رحلة من كايا. حذفه الوحيد نسخةٌ قديمة لسطرٍ أنشأه هو، حين ينقله
إلى مفتاح وقته الجديد (إذن المالك ٢٠٢٦-١٠-٠٥). ولا يكتب فوق:
- رحلة كانت في كايا قبله (قراره «تبقى كما هي»)،
- ولا رحلة عدّلها موظف يدويًّا (قاعدة كايا «التعديل اليدوي يغلب»)،
- ولا رحلة حُذفت بعد نقلها.
"""

from __future__ import annotations

import copy
import datetime
import hashlib
import json
import os
import re
import sys
import time
from typing import Any

import cloud
import common
import merge

PROJECT_DIR = os.path.dirname(common.BASE_DIR)
MAIN_KEY_FILE = os.path.join(PROJECT_DIR, "serviceAccountKey.json")
SECRETS_JS = os.path.join(PROJECT_DIR, "src", "fq_secrets.js")
MEMORY_FILE = os.path.join(common.DATA_DIR, "kaya_memory.json")

# صالة LIVE FLT ← مصدر رحلة الصالة في كايا ← عقدتها. مطابق لـ FLIGHT_NODES
# في src/fq_helpers.js حرفيًّا، وذاك المالك الوحيد لأسماء العقد هناك.
TERMINALS = {"N": "north", "1": "t1", "4": "hall4"}
NODES = {"north": "flights_north", "t1": "flights_t1", "hall4": "flights_hall4"}
SOURCE = "live_flt"
TYPE = "LIVE FLT"
AUTHOR = "LIVE FLT"
FULL_EVERY = 900
# المعلومات التي تدخل سجلّ كايا؛ الخلاف في الحالة لا يمنع النقل لأنها لا تُنقل.
BLOCKING = ("terminal", "sched", "est", "dest")
COMPARED = ("al", "flt", "to", "std", "date", "depTime", "terminal")

FLIGHT = re.compile(r"^[A-Z0-9]{3,8}$")
CLOCK = re.compile(r"^\d{1,2}:\d{2}$")
DEST = re.compile(r"^[A-Z]{3}$")
UNSAFE = re.compile(r"[.#$\[\]/]")


# ═══ هوية الرحلة — نسخة من fq_helpers.js، فلا تبتعد عنها ═══

def flight_key(source: str, date: str, flt: str, std: str) -> str:
    """مفتاح القاعدة كما يبنيه flightKey في fq_helpers.js."""
    return UNSAFE.sub("-", f"{source}_{date}_{flt}_{std}")


def flight_slot(source: str, date: str, flt: str) -> str:
    """موضع رحلة الصالة بلا وقت، كما يبنيه flightSlot في fq_helpers.js."""
    return f"{source}|{date}|{flt}"


def slot_of_key(key: str) -> str | None:
    """موضع الرحلة من مفتاحها المخزَّن، أو لا شيء لمفتاح بصيغة أخرى."""
    parts = key.split("_")
    if len(parts) < 4 or parts[0] not in NODES:
        return None
    return flight_slot(parts[0], parts[1], parts[2])


# ═══ رحلة LIVE FLT ← سجلّ كايا ═══

def clock(value: Any) -> str | None:
    """الوقت بخانتين للساعة، أو لا شيء لغير الوقت."""
    text = str(value or "")
    return text.zfill(5) if CLOCK.match(text) else None


def chosen_time(node: dict) -> tuple:
    """(المجدول، المتوقع إن خالف المجدول)."""
    fields = node.get("f") or {}
    sched = clock((fields.get("sched") or {}).get("v"))
    est = clock((fields.get("est") or {}).get("v"))
    return sched, (est if est and est != sched else None)


def pick_time(node: dict, pick: Any) -> str | None:
    """الوقت الذي يُكتب في كايا (قرارات المالك ٢٠٢٦-١٠-٠٥).

    اختياره في النافذة يُتبع ما دام المتوقع كما رآه حين اختار. فإن تغيّر
    المتوقع بعدها كُتب الجديد تلقائيًّا، وكذلك رحلة لم يُسأل عنها.
    """
    sched, est = chosen_time(node)
    if est is None:
        return sched
    if isinstance(pick, dict) and pick.get("est") == est and pick.get("t") in ("sched", "est"):
        return sched if pick["t"] == "sched" else est
    return est


def departure_iso(day: str, sched: str, at: str) -> str | None:
    """لحظة الإقلاع بصيغة toISOString في الجوال، بقاعدة merge.departure_moment."""
    flight = {"fields": {"est": {"value": at, "values": {}},
                         "sched": {"value": sched, "values": {}}}}
    moment = merge.departure_moment(day, flight)
    if moment is None:
        return None
    utc = moment.astimezone(datetime.timezone.utc)
    return utc.strftime("%Y-%m-%dT%H:%M:%S.000Z")


def blocked_by_conflict(node: dict) -> bool:
    """رحلة فيها خلاف في معلومة تدخل كايا: لا تُنقل حتى يُحسم."""
    fields = node.get("f") or {}
    return any((fields.get(name) or {}).get("st") == "conflict" for name in BLOCKING)


def to_kaya(day: str, terminal: str, node: dict, pick: Any, stamp: str) -> tuple:
    """(السجلّ، سبب الترك). السبب "conflict" أو "invalid" أو ""."""
    if blocked_by_conflict(node):
        return None, "conflict"
    numbers = node.get("n") or []
    flt = str(numbers[0]) if numbers else ""
    dest = str(((node.get("f") or {}).get("dest") or {}).get("v") or "")
    sched, _ = chosen_time(node)
    at = pick_time(node, pick)
    if not (FLIGHT.match(flt) and DEST.match(dest) and sched and at and terminal in TERMINALS):
        return None, "invalid"
    departs = departure_iso(day, sched, at)
    if departs is None:
        return None, "invalid"
    return {
        "al": flt[:2], "flt": flt, "to": dest, "std": at, "type": TYPE, "dpax": "",
        "date": day, "depTime": departs, "terminal": TERMINALS[terminal],
        "src": SOURCE, "updatedBy": AUTHOR, "updatedAt": stamp,
    }, ""


def record_hash(record: dict) -> str:
    """بصمة ما يُقارن من السجلّ، بلا طابع وقت التحديث."""
    text = json.dumps({k: record.get(k) for k in COMPARED}, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(text.encode()).hexdigest()[:10]


def iso_now() -> str:
    """الآن بصيغة toISOString في الجوال، كطابع flights_meta."""
    now = datetime.datetime.now(datetime.timezone.utc)
    return now.strftime("%Y-%m-%dT%H:%M:%S.") + f"{now.microsecond // 1000:03d}Z"


def main_database_url() -> str:
    """رابط القاعدة الرئيسة من ملف المشروع نفسه، لا نسخة منه هنا."""
    with open(SECRETS_JS, encoding="utf-8") as stream:
        found = re.search(r'FIREBASE_URL\s*=\s*"(https://[^"]+)"', stream.read())
    if not found:
        raise RuntimeError("لم يوجد رابط القاعدة الرئيسة في fq_secrets.js")
    return found.group(1).rstrip("/")


def as_dict(value: Any) -> dict:
    """القيمة إن كانت قاموسًا، وإلا قاموس فارغ — القاعدة مفتوحة فلا يُوثق بشكلها."""
    return value if isinstance(value, dict) else {}


def valid_link(value: Any) -> bool:
    return isinstance(value, dict) and value.get("on") is True and isinstance(value.get("at"), int)


# ═══ الكتابة ═══

class KayaBridge:
    """ينقل الصالات المربوطة إلى كايا، والمتغيّر وحده."""

    def __init__(self, main_url: str, main_token, jed: Any, session: Any,
                 memory_file: str | None = None, dry: bool = False) -> None:
        self.main_url, self.main_token, self.jed = main_url, main_token, jed
        self.session, self.memory_file, self.dry = session, memory_file, dry
        self.memory: dict = common.read_json(memory_file, {}) if memory_file else {}
        self.planned: list = []

    # — الطلبات —
    def _main_get(self, path: str, params: dict | None = None) -> Any:
        query = dict(params or {}, access_token=self.main_token())
        response = self.session.get(f"{self.main_url}/{path}.json", params=query,
                                    timeout=cloud.TIMEOUT)
        response.raise_for_status()
        return response.json()

    def _read_days(self, node: str, source: str, days: list) -> dict:
        """سجلّات الصالة لليومين وحدهما، بمدى المفاتيح فلا تُنزَّل الأيام الماضية.
        الترتيب بالمفتاح لا يحتاج فهرسًا في قواعد الأمان (قيس ٢٠٢٦-١٠-٠٥: ٢٠٠)."""
        found = self._main_get(node, {"orderBy": '"$key"', "startAt": f'"{source}_{days[0]}"',
                                      "endAt": f'"{source}_{days[-1]}_\uf8ff"'})
        return {k: v for k, v in as_dict(found).items() if isinstance(v, dict)}

    def _main_patch(self, path: str, updates: dict) -> None:
        if self.dry:
            self.planned.append(("main", path, updates))
            return
        response = self.session.patch(f"{self.main_url}/{path}.json",
                                      data=json.dumps(updates, ensure_ascii=False).encode(),
                                      params={"access_token": self.main_token()},
                                      timeout=cloud.TIMEOUT)
        response.raise_for_status()

    def _jed_get(self, path: str) -> Any:
        response = self.session.get(f"{self.jed.url}/{path}.json",
                                    params={"access_token": self.jed.token()},
                                    timeout=cloud.TIMEOUT)
        response.raise_for_status()
        return response.json()

    def _jed_patch(self, path: str, updates: dict) -> None:
        if self.dry:
            self.planned.append(("jed", path, updates))
            return
        self.jed.patch(path, updates)

    # — الدورة —
    def run(self, state: dict, choices: dict, days: list, now_ms: int) -> dict:
        """دورة واحدة لكل صالة مربوطة. يُرجع ما فُعل لكل صالة."""
        remote = self._jed_get("jed/kaya")
        remote = remote if isinstance(remote, dict) else {}
        links = as_dict(remote.get("links"))
        picks = as_dict(remote.get("picks"))
        compact = {day: cloud.compact_day(merge.merge_day(state, day, choices)) for day in days}
        report = {}
        for terminal in common.WANTED:
            if valid_link(links.get(terminal)):
                report[terminal] = self._run_terminal(terminal, links[terminal], compact,
                                                      picks, days, now_ms)
            else:
                self.memory.pop(TERMINALS[terminal], None)
        self._forget_old_picks(picks, days)
        if self.memory_file and not self.dry:
            common.write_json(self.memory_file, self.memory)
        return report

    def _forget_old_picks(self, picks: dict, days: list) -> None:
        """اختيارات الأيام التي خرجت من LIVE FLT تُمحى كما يُمحى يومها هناك."""
        old = [day for day in picks if day < days[0]]
        if old:
            self._jed_patch("jed/kaya/picks", {day: None for day in old})

    def _desired(self, terminal: str, compact: dict, picks: dict, days: list) -> tuple:
        """{الموضع: السجلّ} لكل رحلة تُنقل، وعدد ما فيه خلاف، وعدد المرفوض."""
        source = TERMINALS[terminal]
        stamp = iso_now()
        desired, conflict, invalid = {}, 0, 0
        for day in days:
            day_picks = as_dict(picks.get(day))
            for key, node in (compact[day].get(terminal) or {}).items():
                record, why = to_kaya(day, terminal, node, day_picks.get(key), stamp)
                if why == "conflict":
                    conflict += 1
                elif why:
                    invalid += 1
                else:
                    desired[flight_slot(source, day, record["flt"])] = record
        return desired, conflict, invalid

    def _run_terminal(self, terminal: str, link: dict, compact: dict, picks: dict,
                      days: list, now_ms: int) -> dict:
        source = TERMINALS[terminal]
        mem = self.memory.setdefault(source, {"slots": {}, "done": 0, "full": 0})
        before = copy.deepcopy(mem)
        try:
            return self._run_terminal_once(terminal, source, mem, link, compact, picks,
                                           days, now_ms)
        except Exception:
            # لم تصل الكتابة: الذاكرة ترجع كما كانت، وإلا ظنّ الجسر أنه كتب ما لم يكتب
            # فعدّه محذوفًا في الدورة التالية وأوقف الربط.
            self.memory[source] = before
            raise

    def _run_terminal_once(self, terminal: str, source: str, mem: dict, link: dict,
                           compact: dict, picks: dict, days: list, now_ms: int) -> dict:
        node = NODES[source]
        slots = mem["slots"]
        for slot in [s for s in slots if s.split("|")[1] < days[0]]:
            del slots[slot]   # يوم مضى: تبقى رحلاته في كايا ولا تُتابَع
        desired, conflict, invalid = self._desired(terminal, compact, picks, days)
        new = [s for s in desired if s not in slots]
        changed = [s for s in desired if slots.get(s, {}).get("state") == "live"
                   and slots[s].get("hash") != record_hash(desired[s])]
        full = time.time() - mem.get("full", 0) >= FULL_EVERY
        request = link["at"] != mem.get("done")
        result = {"added": 0, "updated": 0, "conflict": conflict, "invalid": invalid}
        if not (new or changed or full or request):
            return result

        whole = self._read_days(node, source, days)
        by_slot: dict = {}
        for key in sorted(whole):
            slot = slot_of_key(key)
            if slot:
                by_slot.setdefault(slot, []).append(key)
        if self._all_removed(slots, whole, by_slot):
            self._stop(terminal, source, now_ms)
            return dict(result, stopped=True)
        for slot, entry in list(slots.items()):
            if entry.get("state") == "foreign" and entry["key"] not in whole:
                del slots[slot]   # رحلة كانت لغيرنا حُذفت: موضعها يعود حرًّا

        updates: dict = {}
        # الأهداف قبل الإضافة، فما يُضاف الآن لا يُحدَّث في الدورة نفسها.
        targets = [s for s in desired if slots.get(s, {}).get("state") == "live"] if full else changed
        added, reclaimed = self._add_new(desired, new, slots, whole, by_slot, updates)
        result["added"] = added
        result["updated"] = self._update(desired, targets + reclaimed, slots, whole, by_slot,
                                         updates, full)
        result["existing"] = sum(1 for s in desired if slots.get(s, {}).get("state") == "foreign")
        if updates:
            self._main_patch(node, updates)
            self._main_patch("flights_meta", {"lastUpdateAt": iso_now(), "lastUpdateBy": AUTHOR})
            common.log("ترحيل إلى كايا", {"الصالة": common.TERMINAL_NAMES[terminal],
                                            "أُضيفت": result["added"], "حُدّثت": result["updated"]})
        if full:
            mem["full"] = time.time()
        if request:
            self._jed_patch(f"jed/kaya/links/{terminal}/r", {
                "at": link["at"], "added": result["added"], "updated": result["updated"],
                "existing": result["existing"], "conflict": conflict, "done": now_ms})
            mem["done"] = link["at"]
        return result

    @staticmethod
    def _ours(whole: dict, key: str) -> bool:
        return as_dict(whole.get(key)).get("src") == SOURCE

    def _all_removed(self, slots: dict, whole: dict, by_slot: dict) -> bool:
        """كل ما نقلناه اختفى من كايا: زرّ «حذف كل رحلات الصالة» ضُغط. وسطرٌ نُقل
        إلى مفتاح آخر في موضعه نفسه (حفظ مشرف) باقٍ لا محذوف."""
        ours = [(slot, e["key"]) for slot, e in slots.items() if e.get("state") == "live"]
        return bool(ours) and not any(
            key in whole or any(self._ours(whole, k) for k in by_slot.get(slot, []))
            for slot, key in ours)

    def _stop(self, terminal: str, source: str, now_ms: int) -> None:
        self._jed_patch(f"jed/kaya/links/{terminal}",
                        {"on": False, "stopped": "deleted", "at": now_ms})
        self.memory.pop(source, None)
        common.log("أُوقف الترحيل إلى كايا", {"الصالة": common.TERMINAL_NAMES[terminal],
                                               "السبب": "حُذفت رحلاته كلها من كايا"})

    def _add_new(self, desired: dict, new: list, slots: dict, whole: dict, by_slot: dict,
                 updates: dict) -> tuple:
        """يُرجع عدد المضاف، والمواضع التي وُجد فيها سطرٌ لنا من ربطٍ سابق فيُتابَع."""
        added, reclaimed = 0, []
        for slot in new:
            taken = by_slot.get(slot, [])
            if taken:
                mine = [k for k in taken if self._ours(whole, k)]
                if mine:   # كتبناه قبل إيقاف الربط ثم أُعيد: سطرنا لا سطر غيرنا
                    slots[slot] = {"key": mine[0], "hash": "", "state": "live"}
                    reclaimed.append(slot)
                else:
                    slots[slot] = {"key": taken[0], "state": "foreign"}
                continue
            record = desired[slot]
            key = flight_key(record["terminal"], record["date"], record["flt"], record["std"])
            updates[key] = record
            slots[slot] = {"key": key, "hash": record_hash(record), "state": "live"}
            added += 1
        return added, reclaimed

    def _update(self, desired: dict, targets: list, slots: dict, whole: dict, by_slot: dict,
                updates: dict, full: bool) -> int:
        """يكتب ما تغيّر. وتغيّرُ الوقت ينقل السطر إلى مفتاحه الجديد ويحذف نسخته
        القديمة في الطلب نفسه (إذن المالك ٢٠٢٦-١٠-٠٥)، كما ينقله حفظ المشرف في
        كايا، فيبقى زرّ الحذف هناك يجده. ولا يُحذف إلا سطرٌ لنا (src = live_flt)."""
        updated = 0
        for slot in targets:
            entry = slots[slot]
            key = self._locate(entry, slot, whole, by_slot)
            if key is None:
                entry["state"] = "dead"      # حُذفت بعد نقلها: لا تُعاد
                continue
            current = whole[key]
            if current.get("src") != SOURCE:
                entry["state"] = "manual"    # عدّلها موظف: التعديل اليدوي يغلب
                continue
            record = desired[slot]
            entry["hash"] = record_hash(record)
            target = flight_key(record["terminal"], record["date"], record["flt"], record["std"])
            if target != key and self._ours(whole, target):
                updates[key] = None              # سطرنا في مفتاحه الصحيح أصلًا: تُحذف النسخة الأخرى
                key = entry["key"] = target
                current = whole[key]
            if full:   # نسخ قديمة لسطرنا أعادها حفظُ جوالٍ لم يتزامن بعد
                for stale in by_slot.get(slot, []):
                    if stale != key and self._ours(whole, stale):
                        updates[stale] = None
            if target != key and target not in whole:
                updates[target] = dict(current, **record)
                updates[key] = None
                entry["key"] = target
                updated += 1
                continue
            diff = {f: record[f] for f in COMPARED if current.get(f) != record[f]}
            if not diff:
                continue
            for field, value in dict(diff, updatedBy=AUTHOR, updatedAt=record["updatedAt"]).items():
                updates[f"{key}/{field}"] = value
            updated += 1
        return updated

    def _locate(self, entry: dict, slot: str, whole: dict, by_slot: dict) -> str | None:
        """مفتاح سطرنا الآن: المخزَّن، أو مفتاحٌ في موضعه نفسه نقله إليه حفظ مشرف."""
        if entry["key"] in whole:
            return entry["key"]
        moved = [k for k in by_slot.get(slot, []) if self._ours(whole, k)]
        if not moved:
            return None
        entry["key"] = moved[0]
        return moved[0]


def connect(uploader: Any, session: Any) -> KayaBridge | None:
    """الجسر جاهزًا، أو لا شيء إن نقص المفتاح فيبقى الجامع كما كان."""
    if uploader is None or not os.path.exists(MAIN_KEY_FILE):
        return None
    key = common.read_json(MAIN_KEY_FILE, {})
    if not key:
        return None
    return KayaBridge(main_database_url(), cloud.TokenKeeper(key, session), uploader,
                      session, MEMORY_FILE)


def dry_run() -> None:
    """يعرض ما سيُكتب ولا يكتب شيئًا، ولا يمسّ السجل ولا الذاكرة."""
    import tempfile
    common.LOG_FILE = os.path.join(tempfile.mkdtemp(), "dry-log.jsonl")
    import sources
    session = sources.requests.Session()
    uploader = cloud.connect(session)
    bridge = connect(uploader, session)
    if bridge is None:
        print("لا مفتاح للقاعدة الرئيسة أو لقاعدة LIVE FLT.")
        return
    bridge.dry, bridge.memory_file = True, None
    bridge.memory = common.read_json(MEMORY_FILE, {})
    state = common.read_json(common.STATE_FILE, {})
    choices = common.read_json(common.CHOICES_FILE, {})
    first = common.today()
    days = [first.isoformat(), (first + datetime.timedelta(days=1)).isoformat()]
    wanted = [a for a in sys.argv[1:] if a in TERMINALS]
    if wanted:
        original = bridge._jed_get

        def pretend(path: str) -> Any:
            data = original(path) or {}
            links = data.setdefault("links", {})
            for terminal in wanted:
                links[terminal] = {"on": True, "at": int(time.time() * 1000)}
            return data
        bridge._jed_get = pretend  # type: ignore[method-assign]
    report = bridge.run(state, choices, days, int(time.time() * 1000))
    print(json.dumps(report, ensure_ascii=False, indent=1))
    for target, path, updates in bridge.planned:
        print(f"— {target} {path}: {len(updates)} مسار")
        for k in list(updates)[:5]:
            print("   ", k, json.dumps(updates[k], ensure_ascii=False))


if __name__ == "__main__":
    if "--dry" in sys.argv:
        dry_run()
    else:
        print("الاستعمال: python3 kaya_bridge.py --dry [N] [1] [4]")
