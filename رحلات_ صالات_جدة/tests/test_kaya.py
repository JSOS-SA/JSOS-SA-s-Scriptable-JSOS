"""اختبارات الترحيل إلى تيوب كايا (أمر المالك ٢٠٢٦-١٠-٠٥) بقاعدتين وهميتين في الذاكرة."""

from __future__ import annotations

import datetime as _dt
import json
import os
import sys
import tempfile
from urllib.parse import urlparse

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))

import common as _common

_common.LOG_FILE = os.path.join(tempfile.mkdtemp(), "test-log.jsonl")
_common.now = lambda: _dt.datetime(2026, 10, 3, 0, 0, tzinfo=_common.RIYADH)

import collector
import kaya_bridge
import sources

DAY = "2026-10-03"
MAIN = "https://main.example"
JED = "https://jed.example"


def row(nums, terminal="N", sched="10:00", dest="CAI", status="مجدولة", est=None):
    return sources.record(nums=list(nums), date=DAY, terminal=terminal,
                          sched=sched, est=est, dest=dest, status=status)


def state_of(**by_source) -> dict:
    state = collector.empty_state()
    for source, rows in by_source.items():
        collector.store(state, source, {DAY: rows})
    return state


def node(sched="10:00", est=None, dest="CAI", nums=("SV1",), conflict=()):
    fields = {"terminal": {"v": "N", "st": "agreed"}, "sched": {"v": sched, "st": "agreed"},
              "est": {"v": est, "st": "agreed"}, "dest": {"v": dest, "st": "agreed"},
              "status": {"v": "مجدولة", "st": "agreed"}}
    for name in conflict:
        fields[name] = {"v": None, "st": "conflict", "s": {"jeddah": "x", "kupi": "y"}}
    return {"n": list(nums), "f": fields}


# ─── قاعدتان وهميتان ───

class Response:
    def __init__(self, data):
        self.data = data

    def raise_for_status(self):
        pass

    def json(self):
        return self.data


class Store:
    """قاعدة في الذاكرة تفهم GET وshallow وPATCH متعدد المسارات كما في الوثائق."""

    def __init__(self, data=None):
        # نسخة لا مرجع: الكتابة هنا لا تغيّر ثوابت الاختبارات المشتركة.
        self.data = json.loads(json.dumps(data or {}))

    def _walk(self, parts, create=False):
        here = self.data
        for part in parts:
            if not isinstance(here, dict) or part not in here:
                if not create:
                    return None
                here[part] = {}
            here = here[part]
        return here

    def get(self, path, shallow=False, params=None):
        value = self._walk([p for p in path.split("/") if p])
        if shallow and isinstance(value, dict):
            return {k: True for k in value}
        if params and params.get("orderBy") == '"$key"' and isinstance(value, dict):
            low, high = json.loads(params["startAt"]), json.loads(params["endAt"])
            value = {k: v for k, v in value.items() if low <= k <= high}
        return json.loads(json.dumps(value)) if value is not None else None

    def patch(self, path, updates):
        base = [p for p in path.split("/") if p]
        for key, value in updates.items():
            parts = base + [p for p in key.split("/") if p]
            parent = self._walk(parts[:-1], create=True)
            assert isinstance(parent, dict)
            if value is None:
                parent.pop(parts[-1], None)
            else:
                parent[parts[-1]] = value


class Session:
    def __init__(self, main, jed):
        self.stores = {MAIN: main, JED: jed}
        self.patches = []

    def _split(self, url):
        parsed = urlparse(url)
        return self.stores[f"{parsed.scheme}://{parsed.netloc}"], parsed.path[:-len(".json")]

    def get(self, url, params=None, timeout=None):
        store, path = self._split(url)
        return Response(store.get(path, shallow=(params or {}).get("shallow") == "true",
                                  params=params))

    def patch(self, url, data=None, params=None, timeout=None):
        store, path = self._split(url)
        assert data is not None
        updates = json.loads(data)
        self.patches.append((url, updates))
        store.patch(path, updates)
        return Response({})


class Jed:
    """يقوم مقام الرافع: رابط قاعدة LIVE FLT ورمزها وطلب الكتابة فيها."""

    def __init__(self, session):
        self.url, self.session = JED, session

    def token(self):
        return "t"

    def patch(self, path, updates):
        self.session.patch(f"{self.url}/{path}.json", data=json.dumps(updates).encode())


def bridge_with(main=None, links=None, picks=None):
    main_store = Store(main or {})
    jed_store = Store({"jed": {"kaya": {"links": links or {}, "picks": picks or {}}}})
    session = Session(main_store, jed_store)
    bridge = kaya_bridge.KayaBridge(MAIN, lambda: "t", Jed(session), session)
    return bridge, main_store, jed_store, session


LINK = {"N": {"on": True, "at": 100}}


def main_patches(session):
    return [u for url, u in session.patches if url.startswith(MAIN + "/flights_north")]


# ─── التحويل ───

def test_record_has_only_the_usual_fields():
    record, why = kaya_bridge.to_kaya(DAY, "N", node(), None, "S")
    assert why == ""
    assert set(record) == {"al", "flt", "to", "std", "type", "dpax", "date", "depTime",
                           "terminal", "src", "updatedBy", "updatedAt"}
    assert (record["al"], record["flt"], record["to"], record["std"]) == ("SV", "SV1", "CAI", "10:00")
    assert record["terminal"] == "north" and record["date"] == DAY
    assert record["depTime"] == "2026-10-03T07:00:00.000Z"   # ١٠:٠٠ بتوقيت جدة


def test_status_is_not_carried():
    record, _ = kaya_bridge.to_kaya(DAY, "N", node(), None, "S")
    assert "status" not in record


def test_estimated_time_is_written_when_nobody_was_asked():
    record, _ = kaya_bridge.to_kaya(DAY, "N", node(sched="05:50", est="06:05"), None, "S")
    assert record["std"] == "06:05"


def test_pick_of_scheduled_time_is_kept_while_estimate_unchanged():
    pick = {"t": "sched", "est": "06:05"}
    record, _ = kaya_bridge.to_kaya(DAY, "N", node(sched="05:50", est="06:05"), pick, "S")
    assert record["std"] == "05:50"


def test_new_estimate_after_the_pick_is_written_automatically():
    pick = {"t": "sched", "est": "06:05"}
    record, _ = kaya_bridge.to_kaya(DAY, "N", node(sched="05:50", est="06:30"), pick, "S")
    assert record["std"] == "06:30"


def test_conflict_in_a_carried_field_blocks():
    for name in ("terminal", "sched", "est", "dest"):
        _, why = kaya_bridge.to_kaya(DAY, "N", node(conflict=(name,)), None, "S")
        assert why == "conflict", name


def test_conflict_in_status_does_not_block():
    _, why = kaya_bridge.to_kaya(DAY, "N", node(conflict=("status",)), None, "S")
    assert why == ""


def test_untrusted_values_are_refused():
    assert kaya_bridge.to_kaya(DAY, "N", node(nums=("<b>1",)), None, "S")[1] == "invalid"
    assert kaya_bridge.to_kaya(DAY, "N", node(dest="cai"), None, "S")[1] == "invalid"
    assert kaya_bridge.to_kaya(DAY, "H", node(), None, "S")[1] == "invalid"


def test_evening_flight_delayed_past_midnight_departs_next_day():
    record, _ = kaya_bridge.to_kaya(DAY, "N", node(sched="23:30", est="00:40"), None, "S")
    assert record["date"] == DAY and record["std"] == "00:40"
    assert record["depTime"] == "2026-10-03T21:40:00.000Z"   # ٠٠:٤٠ يوم ٠٤ بتوقيت جدة


def test_key_and_slot_match_the_phone():
    assert kaya_bridge.flight_key("north", DAY, "SV1", "10:00") == "north_2026-10-03_SV1_10:00"
    assert kaya_bridge.slot_of_key("north_2026-10-03_SV1_10:00") == "north|2026-10-03|SV1"
    assert kaya_bridge.slot_of_key("sch_2026-10-03_SV1_10:00") is None


# ─── الدورة ───

def test_first_request_writes_flights_meta_and_result():
    state = state_of(jeddah=[row(["SV1"]), row(["SV2"], terminal="1")])
    bridge, main, jed, _ = bridge_with(links=LINK)
    bridge.run(state, {}, [DAY], 500)
    assert list(main.data["flights_north"]) == ["north_2026-10-03_SV1_10:00"]
    assert main.data["flights_meta"]["lastUpdateBy"] == "LIVE FLT"
    result = jed.data["jed"]["kaya"]["links"]["N"]["r"]
    assert result["at"] == 100 and result["added"] == 1 and result["conflict"] == 0


def test_unlinked_terminal_is_not_touched():
    state = state_of(jeddah=[row(["SV1"], terminal="1")])
    bridge, main, _, _ = bridge_with(links=LINK)
    bridge.run(state, {}, [DAY], 500)
    assert "flights_t1" not in main.data


def test_nothing_changed_nothing_written():
    state = state_of(jeddah=[row(["SV1"])])
    bridge, _, _, session = bridge_with(links=LINK)
    bridge.run(state, {}, [DAY], 500)
    before = len(session.patches)
    bridge.run(state, {}, [DAY], 600)
    assert len(session.patches) == before


def test_new_estimate_updates_the_same_line():
    state = state_of(jeddah=[row(["SV1"], sched="05:50")])
    bridge, main, _, _ = bridge_with(links=LINK)
    bridge.run(state, {}, [DAY], 500)
    collector.store(state, "jeddah", {DAY: [row(["SV1"], sched="05:50", est="06:20")]})
    bridge.run(state, {}, [DAY], 600)
    flights = main.data["flights_north"]
    # نُقل إلى مفتاحه الجديد وحُذفت نسخته القديمة (إذن المالك ٢٠٢٦-١٠-٠٥): لا سطر ثانٍ
    assert list(flights) == ["north_2026-10-03_SV1_06:20"]
    assert flights["north_2026-10-03_SV1_06:20"]["std"] == "06:20"


def test_delete_all_after_a_move_still_stops_the_link():
    state = state_of(jeddah=[row(["SV1"], sched="05:50")])
    bridge, main, jed, _ = bridge_with(links=LINK)
    bridge.run(state, {}, [DAY], 500)
    collector.store(state, "jeddah", {DAY: [row(["SV1"], sched="05:50", est="06:20")]})
    bridge.run(state, {}, [DAY], 600)
    # زرّ الحذف في كايا يحذف بالمفتاح المحسوب من الوقت الظاهر
    del main.data["flights_north"]["north_2026-10-03_SV1_06:20"]
    bridge.memory["north"]["full"] = 0
    bridge.run(state, {}, [DAY], 700)
    assert jed.data["jed"]["kaya"]["links"]["N"]["on"] is False


def test_supervisor_move_is_followed_not_counted_dead():
    state = state_of(jeddah=[row(["SV1"])])
    bridge, main, _, _ = bridge_with(links=LINK)
    bridge.run(state, {}, [DAY], 500)
    flights = main.data["flights_north"]
    flights["north_2026-10-03_SV1_10:05"] = flights.pop("north_2026-10-03_SV1_10:00")
    collector.store(state, "jeddah", {DAY: [row(["SV1"], est="10:30")]})
    bridge.run(state, {}, [DAY], 600)
    assert list(flights) == ["north_2026-10-03_SV1_10:30"]


def test_failed_write_leaves_memory_untouched():
    state = state_of(jeddah=[row(["SV1"])])
    bridge, _, jed, session = bridge_with(links=LINK)
    original = session.patch

    def broken(url, data=None, params=None, timeout=None):
        if url.startswith(MAIN):
            raise RuntimeError("شبكة")
        return original(url, data, params, timeout)
    session.patch = broken
    try:
        bridge.run(state, {}, [DAY], 500)
    except RuntimeError:
        pass
    assert bridge.memory.get("north", {}).get("slots", {}) == {}
    session.patch = original
    bridge.run(state, {}, [DAY], 600)
    assert jed.data["jed"]["kaya"]["links"]["N"]["on"] is True


def test_relink_reclaims_our_own_lines():
    state = state_of(jeddah=[row(["SV1"])])
    bridge, main, jed, _ = bridge_with(links=LINK)
    bridge.run(state, {}, [DAY], 500)
    jed.data["jed"]["kaya"]["links"]["N"] = {"on": False, "at": 1}
    bridge.run(state, {}, [DAY], 600)
    jed.data["jed"]["kaya"]["links"]["N"] = {"on": True, "at": 700}
    collector.store(state, "jeddah", {DAY: [row(["SV1"], est="10:30")]})
    bridge.run(state, {}, [DAY], 700)
    assert list(main.data["flights_north"]) == ["north_2026-10-03_SV1_10:30"]


def test_flight_already_in_kaya_stays_as_it_is():
    theirs = {"al": "SV", "flt": "SV1", "std": "09:00", "src": "kaia_north", "terminal": "north"}
    state = state_of(jeddah=[row(["SV1"]), row(["SV2"])])
    bridge, main, jed, _ = bridge_with(main={"flights_north": {"north_2026-10-03_SV1_09:00": theirs}},
                                       links=LINK)
    bridge.run(state, {}, [DAY], 500)
    assert main.data["flights_north"]["north_2026-10-03_SV1_09:00"] == theirs
    assert "north_2026-10-03_SV1_10:00" not in main.data["flights_north"]
    assert jed.data["jed"]["kaya"]["links"]["N"]["r"]["existing"] == 1


def test_manual_edit_wins():
    state = state_of(jeddah=[row(["SV1"])])
    bridge, main, _, _ = bridge_with(links=LINK)
    bridge.run(state, {}, [DAY], 500)
    record = main.data["flights_north"]["north_2026-10-03_SV1_10:00"]
    record.update(src="manual_edited", std="11:11")
    collector.store(state, "jeddah", {DAY: [row(["SV1"], est="10:30")]})
    bridge.run(state, {}, [DAY], 600)
    assert record["std"] == "11:11"


def test_one_deleted_flight_is_not_brought_back():
    state = state_of(jeddah=[row(["SV1"]), row(["SV2"])])
    bridge, main, jed, _ = bridge_with(links=LINK)
    bridge.run(state, {}, [DAY], 500)
    del main.data["flights_north"]["north_2026-10-03_SV1_10:00"]
    collector.store(state, "jeddah", {DAY: [row(["SV1"], est="10:30"), row(["SV2"])]})
    bridge.run(state, {}, [DAY], 600)
    assert list(main.data["flights_north"]) == ["north_2026-10-03_SV2_10:00"]
    assert jed.data["jed"]["kaya"]["links"]["N"]["on"] is True


def test_deleting_all_stops_the_link():
    state = state_of(jeddah=[row(["SV1"]), row(["SV2"])])
    bridge, main, jed, _ = bridge_with(links=LINK)
    bridge.run(state, {}, [DAY], 500)
    main.data["flights_north"] = {}
    collector.store(state, "jeddah", {DAY: [row(["SV1"]), row(["SV2"]), row(["SV3"])]})
    bridge.run(state, {}, [DAY], 600)
    link = jed.data["jed"]["kaya"]["links"]["N"]
    assert link["on"] is False and link["stopped"] == "deleted"
    assert main.data["flights_north"] == {}
    bridge.run(state, {}, [DAY], 700)
    assert main.data["flights_north"] == {}


def test_flight_with_conflict_waits_then_moves():
    state = state_of(jeddah=[row(["SV1"], sched="10:00")], kupi=[row(["SV1"], sched="11:00")])
    bridge, main, jed, _ = bridge_with(links=LINK)
    bridge.run(state, {}, [DAY], 500)
    assert not main.data.get("flights_north")
    assert jed.data["jed"]["kaya"]["links"]["N"]["r"]["conflict"] == 1
    choices = {f"{DAY}|SV1|sched": {"value": "11:00"}}
    bridge.run(state, choices, [DAY], 600)
    assert main.data["flights_north"]["north_2026-10-03_SV1_11:00"]["std"] == "11:00"


def test_old_picks_are_forgotten():
    picks = {"2026-10-02": {"SV1": {"t": "est", "est": "10:30"}}, DAY: {"SV2": {"t": "sched"}}}
    bridge, _, jed, _ = bridge_with(links={}, picks=picks)
    bridge.run(state_of(), {}, [DAY], 500)
    assert list(jed.data["jed"]["kaya"]["picks"]) == [DAY]
