"""sources.py — قراءة رحلات المغادرة من المواقع المجانية.

كل موقع له قارئ يحوّل صفحته إلى سجلات بشكل موحّد واحد:

    nums      أرقام الرحلة كلها (الرحلة المشتركة لها أكثر من رقم)
    date      تاريخ الإقلاع بتوقيت جدة
    terminal  رمز الصالة الموحّد: N أو 1 أو 4 أو H، أو كما كتبه الموقع
    sched     وقت الإقلاع المجدول
    dest      رمز مطار الوجهة
    status    الحالة بكلمة عربية من جدول ثابت، أو نص الموقع كما هو
    est       الوقت المتوقع، إن ذكره الموقع
    gate      البوابة، إن ذكرها الموقع
    counter   الكاونتر، إن ذكره الموقع

ورموز الصالات قيست من صفحات حقيقية يوم ٢٠٢٦-١٠-٠٣ لا بالتخمين:
جدة إيربورت وكوبي يكتبان N و1 و4 وH، وإكسيجو يكتب N وT1 وHAJJ.
والحقل الذي لا يذكره الموقع يبقى فارغًا (None) ولا يُملأ من عندنا.

وطريقة القراءة مأخوذة من مشروع الصالة الشمالية، دون أي تعديل فيه.
"""

from __future__ import annotations

import datetime
import json
import os
import re
from typing import Any

import requests

import common

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux aarch64; rv:128.0) Gecko/20100101 Firefox/128.0",
    "Accept-Language": "en,ar;q=0.9",
}
TIMEOUT = 30
JEDDAH_URL = "https://www.jeddah-airport.com/departures.php"
JEDDAH_PERIODS = (0, 6, 12, 18)
KUPI_URL = ("https://www.kupi.com/en/explore/saudi-arabia/jeddah/"
            "king-abdulaziz-international-airport/timetable")
KUPI_HALVES = (("00:00", "11:59"), ("12:00", "23:59"))
IXIGO_URL = "https://www.ixigo.com/flight-status/airport/jeddah-jed-airport"
AIRPORT = "JED"

# الحالات بجداول ثابتة. ما لا يرد هنا يُعرض كما كتبه الموقع، ولا يُترجم ظنًّا.
SCHEDULED = "مجدولة"
DELAYED = "متأخرة"
DEPARTED = "أقلعت"
CANCELLED = "ألغيت"
DIVERTED = "تحوّلت"
JEDDAH_STATES = {
    "scheduled": SCHEDULED,
    "en route": DEPARTED,
    "departed": DEPARTED,
    "landed": DEPARTED,
    "cancelled": CANCELLED,
    "canceled": CANCELLED,
    "diverted": DIVERTED,
}
IXIGO_STATES = {
    "scheduled": SCHEDULED,
    "delayed": DELAYED,
    "departed": DEPARTED,
    "en route": DEPARTED,
    "landed": DEPARTED,
    "arrived": DEPARTED,
    "cancelled": CANCELLED,
    "diverted": DIVERTED,
}
# كوبي يكتب «active» لرحلات لم تقلع بعد (لا وقت إقلاع فعلي لها)، فمعناها غير
# محدّد، ولا تُعدّ حالة. يُعتمد عليه في الإقلاع بوجود وقت الإقلاع الفعلي.
KUPI_STATES = {
    "scheduled": SCHEDULED,
    "delayed": DELAYED,
    "landed": DEPARTED,
    "cancelled": CANCELLED,
    "diverted": DIVERTED,
}
IXIGO_TERMINALS = {"N": "N", "T1": "1", "T4": "4", "HAJJ": "H"}
MONTHS = {name: index for index, name in enumerate(
    ("Jan", "Feb", "Mar", "Apr", "May", "Jun",
     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"), start=1)}

NUMBER_PATTERN = re.compile(r"^([A-Z0-9]{2})\s*0*(\d+)([A-Z]?)$")
TAG_PATTERN = re.compile(r"<[^>]+>")
SPACE_PATTERN = re.compile(r"\s+")
CODE_PATTERN = re.compile(r"\(([A-Z]{3})\)\s*$")
ROW_MARK = '<div class="flight-row"'
NEXT_DATA = re.compile(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', re.DOTALL)
PUSH_PATTERN = re.compile(r'self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)')
SEGMENT_START = '{"operating_carrier":'
IXIGO_DATE = re.compile(r"(\d{1,2})\s+([A-Za-z]{3})")

_session = requests.Session()
_session.headers.update(HEADERS)


def get(url: str, params: dict | None = None) -> str:
    """طلب صفحة واحدة، ويرفع خطأً واضحًا إن ردّ الموقع بغير النجاح."""
    response = _session.get(url, params=params, timeout=TIMEOUT)
    response.raise_for_status()
    return response.text


def flight_number(text: str) -> str:
    """رقم موحّد: «XY0568» و«XY 568» يصيران «XY568».

    المطار يكتب الرقم بأصفار في أوله، والمواقع لا تكتبها، فتُحذف الأصفار
    لئلا تُعدّ رحلة واحدة رحلتين (درس من مشروع صالة الحج).
    """
    cleaned = text.strip().upper()
    found = NUMBER_PATTERN.match(cleaned)
    if not found:
        return cleaned.replace(" ", "")
    return found.group(1) + str(int(found.group(2))) + found.group(3)


def record(**fields: Any) -> dict:
    """سجل رحلة بالحقول الموحّدة، والنص الفارغ يصير None."""
    keys = ("nums", "date", "terminal", "sched", "dest",
            "status", "est", "gate", "counter")
    result = {key: fields.get(key) for key in keys}
    for key in keys[2:]:
        value = result[key]
        if isinstance(value, str):
            result[key] = value.strip() or None
    return result


# ═══ جدة إيربورت ═══

def jeddah_cell(segment: str, name: str) -> str:
    """نص خانة واحدة من صف الموقع بلا وسوم."""
    found = re.search(rf'flight-col__{name}(?:\s[^"]*)?">(.*?)</div>', segment, re.DOTALL)
    if not found:
        return ""
    return SPACE_PATTERN.sub(" ", TAG_PATTERN.sub(" ", found.group(1))).strip()


def jeddah_status(text: str) -> str | None:
    """«Scheduled - Delayed» تصير «متأخرة»، و«En Route - On-time» تصير «أقلعت»."""
    written = text.replace("[+]", "").strip()
    if not written:
        return None
    state, _, deviation = written.partition(" - ")
    word = JEDDAH_STATES.get(state.strip().lower(), written)
    if word == SCHEDULED and deviation.strip().lower().startswith("delay"):
        return DELAYED
    return word


def jeddah_date(html: str, label: str) -> str | None:
    """التاريخ الذي يكتبه الموقع قبل كلمة «Today» أو «Tomorrow»."""
    text = SPACE_PATTERN.sub(" ", TAG_PATTERN.sub(" ", html))
    found = re.search(rf"(\d{{4}}-\d{{2}}-\d{{2}}) {label}\b", text)
    return found.group(1) if found else None


def parse_jeddah(html: str, label: str) -> list:
    """صفوف صفحة واحدة من جدة إيربورت بالشكل الموحّد."""
    day = jeddah_date(html, label)
    if not day:
        raise ValueError(f"لم يُعثر على تاريخ «{label}» في صفحة جدة إيربورت")
    rows = []
    for segment in html.split(ROW_MARK)[1:]:
        numbers = [flight_number(n) for n in jeddah_cell(segment, "flight").split()]
        clock = jeddah_cell(segment, "hour")
        if not numbers or not clock:
            continue
        code = CODE_PATTERN.search(jeddah_cell(segment, "dest-term"))
        rows.append(record(
            nums=numbers, date=day, sched=clock,
            terminal=jeddah_cell(segment, "terminal"),
            dest=code.group(1) if code else jeddah_cell(segment, "dest-term"),
            status=jeddah_status(jeddah_cell(segment, "status")),
        ))
    return rows


def fetch_jeddah(tomorrow: bool) -> tuple:
    """اليوم أو الغد كاملًا من فتراته الأربع: (التاريخ، السجلات)."""
    label = "Tomorrow" if tomorrow else "Today"
    found: dict = {}
    day = None
    # للغد يعرض الموقع فترة منتصف الليل إلى السادسة وحدها (قيس في ٢٠٢٦-١٠-٠٣).
    for period in (JEDDAH_PERIODS[:1] if tomorrow else JEDDAH_PERIODS):
        params: dict = {"tp": period}
        if tomorrow:
            params["day"] = "tomorrow"
        rows = parse_jeddah(get(JEDDAH_URL, params), label)
        for row in rows:
            day = row["date"]
            found[(tuple(row["nums"]), row["sched"])] = row
    return day, list(found.values())


# ═══ كوبي ═══

def kupi_segments(html: str) -> list:
    """مقاطع الرحلات المكتوبة داخل بيانات الصفحة."""
    chunks = PUSH_PATTERN.findall(html)
    if not chunks:
        raise ValueError("صفحة كوبي بلا بيانات رحلات: حجب أو تغيّر في بنيتها")
    text = "".join(json.loads(f'"{chunk}"') for chunk in chunks)
    decoder = json.JSONDecoder()
    segments = []
    position = text.find(SEGMENT_START)
    while position != -1:
        try:
            segment, end = decoder.raw_decode(text, position)
            segments.append(segment)
        except ValueError:
            end = position + len(SEGMENT_START)
        position = text.find(SEGMENT_START, end)
    return segments


def kupi_status(segment: dict) -> str | None:
    """الحالة من كوبي: وقت الإقلاع الفعلي يعني أنها أقلعت."""
    if segment.get("departure_actual_time"):
        return DEPARTED
    return KUPI_STATES.get((segment.get("last_status") or "").lower())


def parse_kupi(html: str) -> list:
    """مغادرات جدة من صفحة كوبي بالشكل الموحّد."""
    rows = []
    for segment in kupi_segments(html):
        if segment.get("departure_airport") != AIRPORT:
            continue
        numbers = [flight_number(f"{segment.get('operating_carrier') or ''}"
                                 f"{segment.get('number') or ''}")]
        for item in segment.get("flights") or []:
            number = flight_number(item.get("flight_number") or "")
            if number and number not in numbers:
                numbers.append(number)
        rows.append(record(
            nums=numbers, date=segment.get("departure_date"),
            sched=segment.get("departure_time"),
            terminal=segment.get("departure_terminal"),
            dest=segment.get("arrival_airport"),
            status=kupi_status(segment),
            est=segment.get("departure_estimated_time"),
            gate=segment.get("departure_gate"),
        ))
    return rows


def fetch_kupi(day: str) -> list:
    """يوم كامل من كوبي على نصفين، فالصفحة الواحدة تقف عند ٥٠٠ مقطع."""
    found: dict = {}
    for time_from, time_to in KUPI_HALVES:
        params = {"direction": "departure", "date": day,
                  "time_from": time_from, "time_to": time_to}
        for row in parse_kupi(get(KUPI_URL, params)):
            found[(tuple(row["nums"]), row["sched"])] = row
    return list(found.values())



# ═══ إيرو داتا بوكس (عبر سوق «رابيد») ═══
# طلب جدول المطار يكلّف وحدتين من ٤٠٠ في الشهر، ويغطي ١٢ ساعة على الأكثر.
# الرد الحقيقي (٢٠٢٦-١٠-٠٥) يكتب الصالات N و1 و4 وH كرموزنا، والرقم بمسافة «SV 590»،
# والوجهة برمزها، وقد يخلو الرمز فيذكر اسم المدينة وحده، فتبقى الوجهة فارغة.

AERO_HOST = "aerodatabox.p.rapidapi.com"
AERO_URL = f"https://{AERO_HOST}/flights/airports/iata/{AIRPORT}/{{start}}/{{end}}"
AERO_PARAMS = {"direction": "Departure", "withLeg": "false", "withCancelled": "true",
               "withCodeshared": "true", "withCargo": "false", "withPrivate": "false",
               "withLocation": "false"}
AERO_HALVES = (("00:00", "11:59"), ("12:00", "23:59"))
AERO_KEY_FILE = os.path.join(common.BASE_DIR, "مفاتيح", "aerodatabox.json")
# الموقع يُجلب ثلاث مرات في اليوم، فلا تؤخذ منه إلا الحالات النهائية التي لا ترجع.
# «متوقعة» و«متأخرة» تتغيران بعد الجلب، فتخالفان «أقلعت» عند غيره وتمنعان الحذف
# التلقائي ساعات (قيس في التجربة الجافة ٢٠٢٦-١٠-٠٥). و«Unknown» و«CanceledUncertain»
# ليستا حالة أصلًا.
AERO_STATES = {
    "Expected": None,
    "CheckIn": None,
    "Boarding": None,
    "GateClosed": None,
    "Delayed": None,
    "Departed": DEPARTED,
    "EnRoute": DEPARTED,
    "Approaching": DEPARTED,
    "Arrived": DEPARTED,
    "Canceled": CANCELLED,
    "Diverted": DIVERTED,
    "Unknown": None,
    "CanceledUncertain": None,
}


def aero_status(word: str | None) -> str | None:
    """حالة الرحلة بالكلمة العربية، أو كما كتبها الموقع إن لم ترد في الجدول."""
    if not word:
        return None
    return AERO_STATES.get(word, word)


def aero_clock(moment: dict | None) -> str | None:
    """الساعة والدقيقة من الوقت المحلي «2026-10-05 00:05+03:00»."""
    local = (moment or {}).get("local") or ""
    return local[11:16] or None


def parse_aerodatabox(data: dict) -> list:
    """رحلات المغادرة من رد جدول المطار، والمكرر حرفيًا يُحفظ مرة واحدة."""
    found: dict = {}
    for flight in data.get("departures") or []:
        movement = flight.get("movement") or {}
        local = (movement.get("scheduledTime") or {}).get("local") or ""
        row = record(
            nums=[flight_number(flight.get("number") or "")],
            date=local[:10] or None,
            terminal=movement.get("terminal"),
            sched=aero_clock(movement.get("scheduledTime")),
            dest=(movement.get("airport") or {}).get("iata"),
            status=aero_status(flight.get("status")),
            est=aero_clock(movement.get("revisedTime")),
            gate=movement.get("gate"),
        )
        found.setdefault((row["nums"][0], row["date"], row["sched"]), row)
    return list(found.values())


def fetch_aerodatabox(day: str) -> tuple:
    """يوم كامل بطلبين، ويعيد الرحلات وما بقي من وحدات الشهر بنص رأس الرد."""
    key = common.read_json(AERO_KEY_FILE, {}).get("api_key")
    if not key:
        raise RuntimeError("ملف مفتاح إيرو داتا بوكس غير موجود أو تالف")
    headers = {"X-RapidAPI-Key": key, "X-RapidAPI-Host": AERO_HOST}
    rows: list = []
    left = None
    for start, end in AERO_HALVES:
        url = AERO_URL.format(start=f"{day}T{start}", end=f"{day}T{end}")
        response = _session.get(url, params=AERO_PARAMS, headers=headers, timeout=TIMEOUT)
        remaining = response.headers.get("x-ratelimit-api-units-remaining")
        if remaining is not None:
            left = int(remaining)
        response.raise_for_status()
        rows.extend(parse_aerodatabox(response.json()))
    return rows, left


# ═══ إكسيجو ═══

def ixigo_date(text: str | None) -> str | None:
    """«Sat, 3 Oct» تاريخًا كاملًا، والسنة من تاريخ جدة اليوم.

    وإن كان الشهر قبل الشهر الحالي بأكثر من ستة أشهر فهو من السنة القادمة،
    كرحلة ٢ يناير تظهر يوم ٣١ ديسمبر.
    """
    found = IXIGO_DATE.search(text or "")
    if not found or found.group(2) not in MONTHS:
        return None
    current = common.today()
    month = MONTHS[found.group(2)]
    year = current.year + (1 if month < current.month - 6 else 0)
    return datetime.date(year, month, int(found.group(1))).isoformat()


def ixigo_clock(milliseconds: Any) -> str | None:
    """طابع زمني بالملّي ثانية وقتًا بتوقيت جدة."""
    if not isinstance(milliseconds, (int, float)):
        return None
    moment = datetime.datetime.fromtimestamp(milliseconds / 1000, common.RIYADH)
    return moment.strftime("%H:%M")


def ixigo_status(flight: dict) -> str | None:
    """الحالة من إكسيجو: «Scheduled» مع «10m Delay» تصير «متأخرة»."""
    written = ((flight.get("statusMap") or {}).get("status") or "").strip()
    if not written:
        return None
    word = IXIGO_STATES.get(written.lower(), written)
    deviation = ((flight.get("departureDeviation") or {}).get("deviationText") or "")
    if word == SCHEDULED and "delay" in deviation.lower():
        return DELAYED
    return word


def parse_ixigo(html: str) -> list:
    """مغادرات جدة الظاهرة في صفحة إكسيجو بالشكل الموحّد."""
    found = NEXT_DATA.search(html)
    if not found:
        raise ValueError("صفحة إكسيجو بلا بيانات رحلات: حجب أو تغيّر في بنيتها")
    page = json.loads(found.group(1))["props"]["pageProps"]
    rows = []
    for flight in page.get("scheduledRouteFlightStatus") or []:
        if ((flight.get("originAirport") or {}).get("code") or "").upper() != AIRPORT:
            continue
        timings = flight.get("timings") or {}
        terminals = flight.get("terminalInfo") or {}
        written = (terminals.get("departureTerminal") or "").strip().upper()
        rows.append(record(
            nums=[flight_number((flight.get("airlineCode") or "")
                                + (flight.get("flightNumber") or ""))],
            date=ixigo_date(timings.get("scheduledDepartureDate")),
            sched=timings.get("scheduledDepartureTime"),
            terminal=IXIGO_TERMINALS.get(written, written),
            dest=(flight.get("destAirport") or {}).get("code"),
            status=ixigo_status(flight),
            est=ixigo_clock(timings.get("estimatedDepTime")),
            gate=(terminals.get("departureGate") or "").strip("() "),
            counter=terminals.get("checkinCounter"),
        ))
    return rows


def fetch_ixigo() -> list:
    """الرحلات الظاهرة الآن في إكسيجو (نافذة الساعات القريبة)."""
    return parse_ixigo(get(IXIGO_URL))
