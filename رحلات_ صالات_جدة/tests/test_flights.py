"""اختبارات على صفحات حقيقية حُفظت من المواقع الثلاثة يوم ٢٠٢٦-١٠-٠٣."""

from __future__ import annotations

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))

import collector
import merge
import sources

FIXTURES = os.path.join(HERE, "fixtures")

# الاختبارات لا تكتب في سجل البرنامج الحقيقي ولا في ملفاته.
import tempfile

import common as _common

_common.LOG_FILE = os.path.join(tempfile.mkdtemp(), "test-log.jsonl")
DAY = "2026-10-03"
# الوقت ثابت في الاختبارات: أول يومها. فرحلات الاختبار لم يحن إقلاعها، ولا تصير
# «أقلعت» تلقائيًا إلا في اختبار يمرّر وقتًا بعدها.
import datetime as _dt

_common.now = lambda: _dt.datetime(2026, 10, 3, 0, 0, tzinfo=_common.RIYADH)


def page(name: str) -> str:
    with open(os.path.join(FIXTURES, name), encoding="utf-8") as stream:
        return stream.read()


def row(nums, terminal="N", sched="10:00", dest="CAI", status="مجدولة", gate=None):
    return sources.record(nums=list(nums), date=DAY, terminal=terminal,
                          sched=sched, dest=dest, status=status, gate=gate)


def state_of(**by_source) -> dict:
    state = collector.empty_state()
    for source, rows in by_source.items():
        collector.store(state, source, {DAY: rows})
    return state


# ─── القراءة ───

def test_jeddah_reads_terminals_and_date():
    rows = sources.parse_jeddah(page("jeddah_today_12.html"), "Today")
    assert {r["date"] for r in rows} == {DAY}
    assert {"N", "1", "4"} <= {r["terminal"] for r in rows}


def test_jeddah_tomorrow_date():
    rows = sources.parse_jeddah(page("jeddah_tomorrow_12.html"), "Tomorrow")
    assert {r["date"] for r in rows} == {"2026-10-04"}


def test_kupi_reads_terminal_four():
    rows = sources.parse_kupi(page("kupi_today.html"))
    assert any(r["terminal"] == "4" for r in rows)


def test_kupi_future_has_no_terminal():
    rows = sources.parse_kupi(page("kupi_future.html"))
    assert rows and all(r["terminal"] is None for r in rows)


def test_ixigo_maps_terminal_codes():
    rows = sources.parse_ixigo(page("ixigo.html"))
    assert {r["terminal"] for r in rows} <= {"N", "1", "4", "H", None}


def test_flight_number_drops_leading_zeros():
    assert sources.flight_number("XY0568") == "XY568"
    assert sources.flight_number("RX 2044") == "RX2044"


def test_status_words():
    assert sources.jeddah_status("Scheduled - Delayed [+]") == "متأخرة"
    assert sources.jeddah_status("En Route - On-time") == "أقلعت"
    assert sources.jeddah_status("Something New") == "Something New"


# ─── الدمج والمقارنة ───

def only_flight(state, choices=None):
    merged = merge.merge_day(state, DAY, choices or {})
    flights = merged["by_terminal"]["N"]
    assert len(flights) == 1
    return flights[0]


def test_agreement_is_recorded_once():
    state = state_of(ixigo=[row(["SV1"])], jeddah=[row(["SV1"])], kupi=[row(["SV1"])])
    flight = only_flight(state)
    assert merge.conflicts(flight) == []
    assert flight["fields"]["sched"]["value"] == "10:00"


def test_disagreement_keeps_every_value():
    state = state_of(jeddah=[row(["SV1"], sched="10:00")], kupi=[row(["SV1"], sched="11:00")])
    flight = only_flight(state)
    assert merge.conflicts(flight) == ["sched"]
    assert flight["fields"]["sched"]["values"] == {"jeddah": "10:00", "kupi": "11:00"}


def test_choice_wins_while_a_site_still_shows_it():
    state = state_of(jeddah=[row(["SV1"], sched="10:00")], kupi=[row(["SV1"], sched="11:00")])
    choices = {merge.choice_key(DAY, "SV1", "sched"): {"value": "11:00"}}
    flight = only_flight(state, choices)
    assert flight["fields"]["sched"]["chosen"] and flight["fields"]["sched"]["value"] == "11:00"
    collector.store(state, "kupi", {DAY: [row(["SV1"], sched="12:00")]})
    flight = only_flight(state, choices)
    assert flight["fields"]["sched"]["conflict"]


def test_codeshare_numbers_join_one_flight():
    state = state_of(jeddah=[row(["SM456", "MS8222"])], ixigo=[row(["MS8222"])])
    flight = only_flight(state)
    assert set(flight["nums"]) == {"SM456", "MS8222"}


def test_flight_that_disappears_is_kept():
    state = state_of(ixigo=[row(["SV1"])])
    collector.store(state, "ixigo", {DAY: []})
    flight = only_flight(state)
    assert flight["gone"] is True


def test_only_the_three_terminals_are_shown():
    state = state_of(jeddah=[row(["SV1"], terminal="H"), row(["SV2"], terminal="4")])
    merged = merge.merge_day(state, DAY, {})
    assert [f["nums"] for f in merged["by_terminal"]["4"]] == [["SV2"]]
    assert all(not merged["by_terminal"][t] for t in ("N", "1"))


def test_terminal_dispute_shows_in_both():
    state = state_of(jeddah=[row(["SV1"], terminal="N")], kupi=[row(["SV1"], terminal="1")])
    merged = merge.merge_day(state, DAY, {})
    assert merged["by_terminal"]["N"] and merged["by_terminal"]["1"]


# ─── إيقاف إكسيجو (قرار المالك ٢٠٢٦-١٠-٠٥): لا يُجلب ولا يدخل المقارنة ───

def test_stopped_site_is_not_pulled():
    assert "ixigo" not in collector.PULLERS and "ixigo" not in collector.EVERY


def test_stopped_site_does_not_enter_comparison():
    state = state_of(jeddah=[row(["SV1"], sched="10:00")], ixigo=[row(["SV1"], sched="11:00")])
    flight = only_flight(state)
    assert flight["showing"] == ["jeddah"]
    assert flight["fields"]["sched"]["values"] == {"jeddah": "10:00"}
    assert merge.conflicts(flight) == []


def test_flight_known_only_to_stopped_site_stays_visible():
    flight = only_flight(state_of(ixigo=[row(["SV1"])]))
    assert flight["gone"] is True
    assert flight["fields"]["terminal"]["value"] == "N"


def test_retire_drops_status_keeps_seen_and_logs():
    state = state_of(ixigo=[row(["SV1"])], kupi=[row(["SV2"])])
    state["sources"] = {"ixigo": {"ok": "x"}, "kupi": {"ok": "y"}}
    collector.retire(state)
    assert "ixigo" not in state["sources"] and "ixigo" not in state["current"]
    assert "ixigo" in state["seen"][DAY] and "kupi" in state["sources"]
    with open(_common.LOG_FILE, encoding="utf-8") as stream:
        assert "إيقاف موقع" in stream.read()


# ─── إيرو داتا بوكس: رد حقيقي حُفظ يوم ٢٠٢٦-١٠-٠٥ (الساعة ٠٠:٠٠–١١:٥٩) ───

def aero_rows():
    import json
    return sources.parse_aerodatabox(json.loads(page("aerodatabox_jed.json")))


def test_aero_reads_terminals_numbers_and_times():
    rows = aero_rows()
    first = next(r for r in rows if r["nums"] == ["FG416"])
    assert first["terminal"] == "H" and first["sched"] == "00:05" and first["dest"] == "KBL"
    assert first["date"] == "2026-10-05"
    assert {"N", "1", "4", "H"} <= {r["terminal"] for r in rows}


def test_aero_exact_duplicates_are_one_row():
    rows = aero_rows()
    assert len(rows) == 180
    assert sum(1 for r in rows if r["nums"] == ["SV1014"]) == 1


def test_aero_destination_without_code_stays_empty():
    flight = next(r for r in aero_rows() if r["nums"] == ["F31773"])
    assert flight["dest"] is None


def test_aero_status_words():
    assert sources.aero_status("Departed") == sources.DEPARTED
    assert sources.aero_status("Expected") is None
    assert sources.aero_status("Delayed") is None
    assert sources.aero_status("Unknown") is None
    assert sources.aero_status("CanceledUncertain") is None


def test_aero_slot_times():
    at = __import__("datetime").datetime(2026, 10, 5, 3, 0, tzinfo=_common.RIYADH)
    assert collector.aero_slot_start(at).hour == 0
    assert collector.aero_seconds_to_next(at) == 5 * 3600
    late = at.replace(hour=23, minute=30)
    assert collector.aero_seconds_to_next(late) == 30 * 60


def test_aero_restart_waits_for_next_slot():
    at = __import__("datetime").datetime(2026, 10, 5, 3, 0, tzinfo=_common.RIYADH)
    fresh = {"ok": "2026-10-05 00:01:00"}
    old = {"ok": "2026-10-04 16:01:00"}
    assert collector.aero_initial_delay(fresh, at) == 5 * 3600
    assert collector.aero_initial_delay(old, at) == 0
    assert collector.aero_initial_delay({}, at) == 0


def test_aero_stops_before_budget_ends_without_asking():
    called = []
    original = sources.fetch_aerodatabox
    sources.fetch_aerodatabox = lambda *a, **k: called.append(1)
    try:
        try:
            collector.pull_aerodatabox({"units_left": collector.AERO_RESERVE})
            raised = False
        except collector.BudgetExhausted:
            raised = True
    finally:
        sources.fetch_aerodatabox = original
    assert raised and not called


def test_aero_old_status_does_not_enter_comparison():
    state = state_of(kupi=[row(["SV1"], status="مجدولة")],
                     aerodatabox=[row(["SV1"], status="أقلعت")])
    for record in state["seen"][DAY]["aerodatabox"].values():
        record["seen"] = "2000-01-01 00:00:00"
    flight = only_flight(state)
    assert flight["fields"]["status"]["values"].get("aerodatabox") is None
    assert not flight["fields"]["status"]["conflict"]
    assert flight["fields"]["terminal"]["values"]["aerodatabox"] == "N"


# ─── «أقلعت» تلقائيًا حين يبلغ العداد ٠٠:٠٠، والحذف بعد ٦ ساعات (أمر المالك ٢٠٢٦-١٠-٠٥) ───

import datetime

import cleanup
import common


def at(clock: str, day: str = DAY) -> datetime.datetime:
    hours, minutes = (int(p) for p in clock.split(":"))
    return datetime.datetime.combine(datetime.date.fromisoformat(day),
                                     datetime.time(hours, minutes), tzinfo=common.RIYADH)


def departed_state(status_kupi="أقلعت"):
    return state_of(jeddah=[row(["SV1"], sched="10:00", status="أقلعت")],
                    kupi=[row(["SV1"], sched="10:00", status=status_kupi)])


def test_removed_after_six_hours():
    state = departed_state()
    assert cleanup.sweep(state, {}, at("16:00")) == [{"اليوم": DAY, "الرحلة": ["SV1"]}]
    assert not merge.merge_day(state, DAY, {})["by_terminal"]["N"]


def test_kept_before_six_hours():
    state = departed_state()
    assert cleanup.sweep(state, {}, at("15:59")) == []
    assert merge.merge_day(state, DAY, {})["by_terminal"]["N"]


def test_removed_even_when_sites_disagree_on_status():
    state = departed_state(status_kupi="مجدولة")
    assert cleanup.sweep(state, {}, at("16:00"))


def test_cancelled_flight_removed_after_six_hours():
    state = state_of(kupi=[row(["SV1"], sched="10:00", status="ألغيت")])
    assert cleanup.sweep(state, {}, at("15:59")) == []
    assert cleanup.sweep(state, {}, at("16:00"))


def test_removed_flight_does_not_come_back():
    state = departed_state()
    cleanup.sweep(state, {}, at("16:00"))
    collector.store(state, "jeddah", {DAY: [row(["SV1"], status="أقلعت")]})
    assert not merge.merge_day(state, DAY, {})["by_terminal"]["N"]
    assert not state["seen"][DAY]["jeddah"]


def test_latest_time_is_used_when_times_differ():
    state = state_of(jeddah=[row(["SV1"], sched="10:00", status="أقلعت")],
                     kupi=[row(["SV1"], sched="11:00", status="أقلعت")])
    assert cleanup.sweep(state, {}, at("16:30")) == []
    assert cleanup.sweep(state, {}, at("17:00"))


def test_late_evening_flight_delayed_past_midnight():
    state = state_of(kupi=[dict(row(["SV1"], sched="23:30", status="مجدولة"), est="00:40")])
    assert cleanup.sweep(state, {}, at("06:39", "2026-10-04")) == []
    assert cleanup.sweep(state, {}, at("06:40", "2026-10-04"))


def test_departed_automatically_when_countdown_ends():
    state = state_of(jeddah=[row(["SV1"], sched="10:00", status="مجدولة")],
                     kupi=[row(["SV1"], sched="10:00", status="متأخرة")])
    before = merge.merge_day(state, DAY, {}, at("09:59"))["by_terminal"]["N"][0]
    after = merge.merge_day(state, DAY, {}, at("10:00"))["by_terminal"]["N"][0]
    assert before["fields"]["status"]["conflict"]
    status = after["fields"]["status"]
    assert status["value"] == "أقلعت" and status["auto"] and not status["conflict"]


def test_estimated_time_moves_the_automatic_departure():
    state = state_of(kupi=[dict(row(["SV1"], sched="10:00"), est="11:00")])
    assert merge.merge_day(state, DAY, {}, at("10:30"))["by_terminal"]["N"][0]["fields"]["status"]["value"] != "أقلعت"
    assert merge.merge_day(state, DAY, {}, at("11:00"))["by_terminal"]["N"][0]["fields"]["status"]["value"] == "أقلعت"


def test_cancelled_is_never_departed_automatically():
    cancelled = state_of(kupi=[row(["SV1"], sched="10:00", status="ألغيت")])
    disputed = state_of(jeddah=[row(["SV1"], sched="10:00", status="ألغيت")],
                        kupi=[row(["SV1"], sched="10:00", status="مجدولة")])
    one = merge.merge_day(cancelled, DAY, {}, at("12:00"))["by_terminal"]["N"][0]["fields"]["status"]
    two = merge.merge_day(disputed, DAY, {}, at("12:00"))["by_terminal"]["N"][0]["fields"]["status"]
    assert one["value"] == "ألغيت" and two["conflict"]


# ─── صالة شركة الطيران بقرار المالك (٢٠٢٦-١٠-٠٥): PC صالة ٤، و3T صالة الحج ───

def test_airline_terminal_rule_settles_the_dispute():
    state = state_of(jeddah=[row(["PC695"], terminal="4")], aerodatabox=[row(["PC695"], terminal="N")])
    merged = merge.merge_day(state, DAY, {})
    result = merged["by_terminal"]["4"][0]["fields"]["terminal"]
    assert result["value"] == "4" and result["rule"] and not result["conflict"]
    assert not merged["by_terminal"]["N"]


def test_hajj_airline_leaves_the_three_terminals():
    state = state_of(kupi=[row(["3T203"], terminal="H")], aerodatabox=[row(["3T203"], terminal="N")])
    merged = merge.merge_day(state, DAY, {})
    assert not any(merged["by_terminal"].values())


def test_airline_rule_ignores_its_codeshare_number_on_another_airline():
    state = state_of(kupi=[row(["XY555", "PC7655"], terminal="1")],
                     jeddah=[row(["XY555", "PC7655"], terminal="1")])
    result = merge.merge_day(state, DAY, {})["by_terminal"]["1"][0]["fields"]["terminal"]
    assert result["value"] == "1" and not result.get("rule")


def test_airline_rule_follows_the_operator_number():
    state = state_of(jeddah=[row(["PC695", "XY5695"], terminal="N")])
    assert merge.merge_day(state, DAY, {})["by_terminal"]["4"]


def test_manual_terminal_beats_airline_rule():
    state = state_of(jeddah=[row(["PC695"], terminal="4")])
    choices = {merge.choice_key(DAY, "PC695", "terminal"): {"value": "1", "source": "manual"}}
    assert merge.merge_day(state, DAY, choices)["by_terminal"]["1"]


# ─── الرفع إلى القاعدة: الصيغة المختصرة ───

import cloud


def test_compact_keeps_conflict_values_only():
    state = state_of(jeddah=[row(["SV1"], sched="10:00")], kupi=[row(["SV1"], sched="11:00")])
    node = cloud.compact_day(merge.merge_day(state, DAY, {}))["N"]["SV1"]
    assert node["f"]["sched"] == {"v": None, "st": "conflict", "s": {"jeddah": "10:00", "kupi": "11:00"}}
    assert node["f"]["dest"] == {"v": "CAI", "st": "agreed"}


def test_manual_value_wins_even_without_conflict():
    state = state_of(jeddah=[row(["SV1"], dest="CAI")], kupi=[row(["SV1"], dest="CAI")])
    choices = {merge.choice_key(DAY, "SV1", "dest"): {"value": "HBE", "source": "manual"}}
    result = only_flight(state, choices)["fields"]["dest"]
    assert result["value"] == "HBE" and result["manual"] and not result["conflict"]


# ─── الرفع: المتغيّر فقط، وختم لكل رحلة ───

class FakeResponse:
    def __init__(self, data=None):
        self.data = data

    def raise_for_status(self):
        pass

    def json(self):
        return self.data


class FakeSession:
    def __init__(self, remote=None):
        self.calls = []
        self.remote = remote

    def patch(self, url, data=None, params=None, timeout=None):
        assert isinstance(data, bytes), "الجسم يُرسل بايتات بترميز يونيكود"
        self.calls.append((url, _json.loads(data)))
        return FakeResponse({})

    def get(self, url, params=None, timeout=None):
        return FakeResponse(self.remote)


import json as _json


def test_push_sends_only_changed_flights_with_stamp():
    state = state_of(jeddah=[row(["SV1"]), row(["SV2"])])
    session = FakeSession()
    uploader = cloud.Uploader("https://x.firebaseio.com", token=lambda: "t", session=session)
    uploader.push(state, {}, [DAY], now_ms=1000)
    first = session.calls[-1][1]
    assert first[f"days/{DAY}/N/SV1"]["u"] == 1000 and f"days/{DAY}/N/SV2" in first
    assert first["meta/u"][DAY]["N"] == 1000
    collector.store(state, "jeddah", {DAY: [row(["SV1"], dest="HBE"), row(["SV2"])]})
    uploader.push(state, {}, [DAY], now_ms=2000)
    second = session.calls[-1][1]
    assert f"days/{DAY}/N/SV1" in second and f"days/{DAY}/N/SV2" not in second


def test_flight_leaving_a_terminal_becomes_tombstone():
    state = state_of(jeddah=[row(["SV1"])])
    session = FakeSession()
    uploader = cloud.Uploader("https://x.firebaseio.com", token=lambda: "t", session=session)
    uploader.push(state, {}, [DAY], now_ms=1000)
    collector.store(state, "jeddah", {DAY: [row(["SV1"], terminal="1")]})
    uploader.push(state, {}, [DAY], now_ms=2000)
    sent = session.calls[-1][1]
    assert sent[f"days/{DAY}/N/SV1"] == {"x": 1, "u": 2000}
    assert sent[f"days/{DAY}/1/SV1"]["u"] == 2000


def test_day_that_left_is_removed():
    state = state_of(jeddah=[row(["SV1"])])
    session = FakeSession()
    uploader = cloud.Uploader("https://x.firebaseio.com", token=lambda: "t", session=session)
    uploader.push(state, {}, [DAY], now_ms=1000)
    uploader.push(state, {}, ["2026-10-04"], now_ms=2000)
    assert session.calls[-1][1][f"days/{DAY}"] is None


def test_choices_newest_wins_and_nothing_deleted():
    local = {f"{DAY}|SV1|gate": {"value": "A1", "source": "kupi", "at_ms": 100},
             f"{DAY}|SV2|dest": {"value": "CAI", "source": "jeddah", "at_ms": 100}}
    remote = {DAY: {"SV1": {"gate": {"value": "B7", "source": "manual", "at": 200}}}}
    merged, to_upload = cloud.merge_choices(local, remote)
    assert merged[f"{DAY}|SV1|gate"]["value"] == "B7"
    assert f"{DAY}|SV2|dest" in merged and f"{DAY}|SV2|dest" in to_upload
    assert f"{DAY}|SV1|gate" not in to_upload


# ─── أعمدة الطرفية: المتوقع يظهر عند التغيّر فقط، والعداد التنازلي ───

import board


def test_etd_hidden_when_same_as_std():
    flight = only_flight(state_of(kupi=[dict(row(["SV1"], sched="10:00"), est="10:00")]))
    assert board.Board.etd_cell(board.Board(), flight["fields"], "")[0] == ""
    flight = only_flight(state_of(kupi=[dict(row(["SV1"], sched="10:00"), est="10:40")]))
    assert board.Board.etd_cell(board.Board(), flight["fields"], "")[0] == "10:40"


def test_ttd_counts_down_and_stops_at_zero():
    flight = only_flight(state_of(kupi=[dict(row(["SV1"], sched="10:00"), est="10:40")]))
    assert board.ttd(DAY, flight, at("08:15")) == "02:25"
    assert board.ttd(DAY, flight, at("11:00")) == "00:00"


def test_same_time_flights_ordered_by_number():
    state = state_of(jeddah=[row(["SV9"]), row(["AB1"]), row(["MS5"], sched="09:00")])
    flights = merge.merge_day(state, DAY, {})["by_terminal"]["N"]
    assert [f["nums"][0] for f in flights] == ["MS5", "AB1", "SV9"]


def test_status_shown_in_english_codes():
    codes = {"أقلعت": "DEP", "مجدولة": "STD", "متأخرة": "DAL", "ألغيت": "CNL", "تحوّلت": "DIV"}
    for arabic, code in codes.items():
        assert board.shown("status", arabic) == code


def test_delayed_and_cancelled_blink():
    for status, blinks in (("متأخرة", True), ("ألغيت", True), ("أقلعت", False), ("مجدولة", False)):
        flight = only_flight(state_of(kupi=[row(["SV1"], status=status)]))
        color = board.Board.cell("status", flight["fields"]["status"], "")[1]
        assert (board.BLINK in color) == blinks


def test_std_struck_only_when_departure_time_changed():
    same = only_flight(state_of(kupi=[dict(row(["SV1"], sched="10:00"), est="10:00")]))
    moved = only_flight(state_of(kupi=[dict(row(["SV1"], sched="10:00"), est="10:40")]))
    assert board.STRIKE not in board.Board().sched_cell(same["fields"], "")[1]
    text, color = board.Board().sched_cell(moved["fields"], "")
    assert text == "10:00" and board.STRIKE in color


def test_departed_hidden_until_shown():
    state = state_of(kupi=[row(["SV1"], status="أقلعت"), row(["SV2"], status="مجدولة")])
    flights = merge.merge_day(state, DAY, {})["by_terminal"]["N"]
    screen = board.Board()
    assert [f["nums"][0] for f in screen.visible_flights(flights)] == ["SV2"]
    screen.toggle_departed()
    assert len(screen.visible_flights(flights)) == 2


def test_disputed_std_is_never_struck():
    state = state_of(jeddah=[dict(row(["SV1"], sched="10:00"), est="11:00")],
                     kupi=[dict(row(["SV1"], sched="10:30"), est="11:00")])
    text, color = board.Board().sched_cell(only_flight(state)["fields"], "")
    assert text == "⚠ خلاف" and board.STRIKE not in color
