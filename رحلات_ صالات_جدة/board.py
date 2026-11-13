"""board.py — شاشة رحلات الصالات الثلاث داخل الطرفية، تعمل بالضغط.

ما يظهر:
- ثلاثة أسطر للصالات: الشمالية، وصالة ١، وصالة ٤. الضغط على سطر يعرض رحلاتها.
- سطر اليوم: الضغط عليه يبدّل بين اليوم والغد.
- سطر المواقع: آخر جلب ناجح من كل موقع، أو علامة التعذّر.
- سطر «إظهار المغادرة»: الرحلات التي أقلعت مخفية حتى تضغطه.
- جدول الرحلات. المعلومة المختلف عليها تظهر بالأصفر «⚠ خلاف»، والمعلومة
  التي اخترتها تظهر بالأخضر مع علامة «✓». الحالة برمز إنجليزي ولون لكل
  حالة، والمتأخرة والملغاة تومضان، والموعد يُشطب إذا تغيّر الإقلاع.
- الضغط على رحلة يفتح تفاصيلها: قيمة كل موقع في سطر. الضغط على قيمة
  يجعلها هي المعتمدة، وتُحفظ في ملف الاختيارات فتبقى بعد إعادة التشغيل.

عن الاتجاه: قيس على هذه الطرفية في ٢٠٢٦-١٠-٠٣ أن الوضع الافتراضي يخلط
ترتيب الأعمدة حين يتجاور العربي واللاتيني، وأن أمر «اتجاه السطر من اليمين»
يرسم الجدول صحيحًا من اليمين إلى اليسار. فكل سطر يُكتب بهذا الأمر.
والضغط يُقرأ بالسطر وحده لا بالعمود، فلا يتأثر بانعكاس الاتجاه.
"""

from __future__ import annotations

import datetime
import json
import os
import select
import shutil
import sys
import termios
import time
import tty
from collections.abc import Callable
from typing import Any

import cleanup
import common
import merge

ESC = "\x1b["
RTL = ESC + "2 k"
RESET = ESC + "0m"
YELLOW = ESC + "33;1m"
GREEN = ESC + "32m"
DIM = ESC + "2m"
INVERT = ESC + "7m"
BOLD = ESC + "1m"
CYAN = ESC + "36m"
RED = ESC + "31;1m"
MAGENTA = ESC + "35m"
ORANGE = ESC + "33m"
BLUE = ESC + "94m"
BLINK = ESC + "5m"
STRIKE = ESC + "9m"
# لون لكل حالة (أمر المالك ٢٠٢٦-١٠-٠٣). الخلاف وحده بالأصفر العريض مع ⚠.
# وبأمره ٢٠٢٦-١٠-٠٣ (الجولة الثانية): الحالة بالإنجليزية، ومجدولة زرقاء، والمتأخرة
# والملغاة تومضان تنبيهًا حتى تتغيّر حالتهما.
STATUS_COLORS = {"مجدولة": BLUE, "متأخرة": ORANGE + BLINK, "أقلعت": GREEN,
                 "ألغيت": RED + BLINK, "تحوّلت": MAGENTA}
STATUS_CODES = {"مجدولة": "STD", "متأخرة": "DAL", "أقلعت": "DEP",
                "ألغيت": "CNL", "تحوّلت": "DIV"}
ARABIC_DIGITS = str.maketrans("0123456789", "٠١٢٣٤٥٦٧٨٩")
# أسماء الأعمدة بأمر المالك ٢٠٢٦-١٠-٠٣، وأُلغي عمودا البوابة والمواقع.
COLUMNS = (("FLT NO", 7), ("STD", 6), ("ETD", 6), ("DEST", 9), ("STS", 7), ("TTD", 5))
# علامة اتجاه غير مرئية من اليمين إلى اليسار حول كل فاصل: بدونها تعامل الطرفية
# رقم الرحلة والأوقات المتجاورة قطعة لاتينية واحدة فتعكس ترتيب أعمدتها.
SEPARATOR = "\u200f│\u200f"
TABLE_TOP = 9
WHEEL_STEP = 3

with open(os.path.join(common.BASE_DIR, "airports_ar.json"), encoding="utf-8") as _f:
    AIRPORTS = json.load(_f)


def arabic_digits(value: Any) -> str:
    """الأعداد بالأرقام العربية في نصوص الشاشة."""
    return str(value).translate(ARABIC_DIGITS)


def shown(field: str, value: str | None) -> str:
    """القيمة كما تُعرض: الوجهة باسم مدينتها العربي إن عُرف."""
    if value is None:
        return "—"
    if field == "dest":
        return AIRPORTS.get(value, value)
    if field == "terminal":
        return common.TERMINAL_NAMES.get(value, value)
    if field == "status":
        return STATUS_CODES.get(value, value)
    return value


def fit(text: str, width: int) -> str:
    """يقص النص أو يملؤه بمسافات حتى يبلغ العرض المطلوب."""
    return text[:width].ljust(width)


def visible(text: str) -> int:
    """عرض النص على الشاشة: علامة الاتجاه لا تشغل خانة."""
    return len(text) - text.count("\u200f")


def cut(text: str, room: int) -> str:
    """يقص النص عند عدد الخانات الظاهرة لا عدد الحروف."""
    if room <= 0:
        return ""
    taken = 0
    for index, character in enumerate(text):
        if character != "\u200f":
            taken += 1
            if taken > room:
                return text[:index]
    return text


def ttd(day: str, flight: dict, now: datetime.datetime | None = None) -> str:
    """العداد التنازلي حتى الإقلاع بصيغة تبويب الصالة ٤ نفسها: ساعات:دقائق،
    وبعد الإقلاع ٠٠:٠٠ لا رقم سالب. وقت الإقلاع هو المتوقع وإلا المجدول،
    وأبعدها عند الخلاف، بالقاعدة نفسها التي يعمل بها الحذف التلقائي."""
    moment = cleanup.departure_moment(day, flight)
    if moment is None:
        return "—"
    minutes = int(((moment - (now or common.now())).total_seconds()) // 60)
    if minutes <= 0:
        return "00:00"
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


def departed(flight: dict) -> bool:
    """أقلعت بقيمة متفق عليها أو مختارة، لا مختلفًا عليها."""
    status = flight["fields"]["status"]
    return not status["conflict"] and status["value"] == cleanup.DEPARTED


def clock_of(moment: str | None) -> str:
    """«2026-10-03 12:51:20» تصير «12:51»."""
    return moment[11:16] if moment else "—"


class Line:
    """سطر واحد على الشاشة: أجزاؤه بألوانها، وما يحدث عند الضغط عليه."""

    def __init__(self, parts: list | None = None,
                 action: Callable[[], None] | None = None) -> None:
        self.parts = parts or []
        self.action = action

    def render(self, width: int) -> str:
        out, used = [], 0
        for text, color in self.parts:
            piece = cut(text, width - used)
            if not piece:
                break
            used += visible(piece)
            out.append(color + piece + RESET if color else piece)
        return "".join(out)


def units_note(info: dict) -> str:
    """رصيد الموقع المحدود ظاهرًا بجانب اسمه، إن كان له رصيد."""
    if info.get("units_left") is None:
        return ""
    return f" — بقي {arabic_digits(info['units_left'])} وحدة"


class Board:
    """حالة الشاشة: الصالة المختارة، واليوم، والرحلة المفتوحة، والتمرير."""

    def __init__(self) -> None:
        self.terminal = "N"
        self.tomorrow = False
        # الرحلات التي أقلعت مخفية دائمًا حتى تُظهرها بالضغط (أمر المالك ٢٠٢٦-١٠-٠٣)،
        # كزرّ «إظهار المغادرة» في تبويبي «كايا» و«جداول» بتطبيق الجوال.
        self.hide_departed = True
        self.opened: dict | None = None
        self.scroll = 0
        self.running = True
        self.state: dict = {}
        self.state_time = -1.0
        self.choices: dict = common.read_json(common.CHOICES_FILE, {})
        self.choices_time = -1.0
        self.lines: list = []

    # ─── البيانات ───

    def day(self) -> str:
        first = common.today()
        return (first + datetime.timedelta(days=1 if self.tomorrow else 0)).isoformat()

    def reload(self) -> None:
        """يعيد قراءة ملف الحالة إن غيّره الجامع."""
        try:
            changed = os.path.getmtime(common.STATE_FILE)
        except OSError:
            return
        if changed != self.state_time:
            self.state = common.read_json(common.STATE_FILE, self.state)
            self.state_time = changed
        # اختيارات الجوالات يكتبها الجامع في ملف الاختيارات، فتُقرأ حين يتغيّر.
        try:
            chosen_at = os.path.getmtime(common.CHOICES_FILE)
        except OSError:
            return
        if chosen_at != self.choices_time:
            self.choices = common.read_json(common.CHOICES_FILE, self.choices)
            self.choices_time = chosen_at

    def choose(self, flight: dict, field: str, source: str, value: str) -> None:
        """يحفظ اختيارك لمعلومة، ويسجله في السجل."""
        key = merge.choice_key(self.day(), flight["nums"][0], field)
        # يُقرأ الملف من جديد قبل الكتابة، فقد كتب فيه الجامع اختيار جوال للتو.
        self.choices = common.read_json(common.CHOICES_FILE, self.choices)
        self.choices[key] = {"value": value, "source": source, "at": common.stamp(),
                             "at_ms": int(time.time() * 1000)}
        common.write_json(common.CHOICES_FILE, self.choices)
        common.log("اختيار صاحب المشروع",
                   {"الرحلة": flight["nums"], "المعلومة": field,
                    "القيمة": value, "الموقع": source})

    # ─── الرسم ───

    def header_lines(self, merged: dict) -> list:
        lines = [Line([("رحلات المغادرة · مطار الملك عبدالعزيز بجدة   ", BOLD),
                       (arabic_digits(common.now().strftime("%H:%M")), CYAN)])]
        for terminal in common.WANTED:
            flights = merged["by_terminal"][terminal]
            disputed = sum(1 for f in flights if merge.conflicts(f))
            mark = "◀ " if terminal == self.terminal else "   "
            color = INVERT if terminal == self.terminal else ""
            text = (f"{mark}{common.TERMINAL_NAMES[terminal]}  "
                    f"{arabic_digits(len(flights))} رحلة")
            parts = [(text, color)]
            if disputed:
                parts.append((f"  ⚠ {arabic_digits(disputed)} فيها خلاف", YELLOW))
            lines.append(Line(parts, self.select_terminal(terminal)))
        label = "الغد" if self.tomorrow else "اليوم"
        other = "اليوم" if self.tomorrow else "الغد"
        lines.append(Line([(f"{label} {arabic_digits(self.day())}", BOLD),
                           (f"   اضغط هنا لعرض {other}", DIM)], self.toggle_day))
        shown_now = merged["by_terminal"][self.terminal]
        hidden = len(shown_now) - len(self.visible_flights(shown_now))
        toggle = "[ إظهار المغادرة ]" if self.hide_departed else "[ إخفاء المغادرة ]"
        note = f"   {arabic_digits(hidden)} رحلة أقلعت مخفية" if self.hide_departed else ""
        lines.append(Line([(toggle, INVERT), (note, DIM)], self.toggle_departed))
        lines.append(Line(self.sources_parts(merged)))
        lines.append(Line([(f"{arabic_digits(merged['no_terminal'])} رحلة لم يذكر أي موقع صالتها، فلا تظهر هنا", DIM)]))
        lines.append(Line([(SEPARATOR.join(fit(name, width) for name, width in COLUMNS), BOLD)]))
        return lines

    def sources_parts(self, merged: dict) -> list:
        parts = []
        for source in merge.SOURCE_ORDER:
            info = self.state.get("sources", {}).get(source, {})
            name = common.SOURCE_NAMES[source]
            if info.get("error"):
                parts.append((f"{name} ✗ تعذّر {arabic_digits(clock_of(info.get('tried')))}  ", YELLOW))
            elif info.get("ok"):
                parts.append((f"{name} ✓ {arabic_digits(clock_of(info.get('ok')))}{units_note(info)}  ", GREEN))
            else:
                parts.append((f"{name} … لم يُجلب بعد  ", DIM))
        return parts

    def flight_line(self, flight: dict) -> Line:
        fields = flight["fields"]
        dim = DIM if flight["gone"] else ""
        cells = [(flight["nums"][0], dim),
                 self.sched_cell(fields, dim),
                 self.etd_cell(fields, dim),
                 self.cell("dest", fields["dest"], dim),
                 self.cell("status", fields["status"], dim),
                 (ttd(self.day(), flight), dim)]
        parts = []
        for (_, width), (text, color) in zip(COLUMNS, cells):
            parts.append((fit(text, width), color))
            parts.append((SEPARATOR, DIM))
        return Line(parts[:-1], self.open_flight(flight))

    @staticmethod
    def cell(field: str, result: dict, dim: str) -> tuple:
        """نص الخانة ولونها: خلاف، أو مختارة، أو مكتوبة باليد، أو متفق عليها."""
        if result["conflict"]:
            return "⚠ خلاف", YELLOW
        text = shown(field, result["value"])
        color = STATUS_COLORS.get(result["value"] or "", dim) if field == "status" else dim
        if result.get("manual"):
            return "✎" + text, color if field == "status" else GREEN
        if result["chosen"]:
            return "✓" + text, color if field == "status" else GREEN
        return text, color

    def sched_cell(self, fields: dict, dim: str) -> tuple:
        """الموعد يُشطب من منتصفه إذا تغيّر موعد الإقلاع، كشطب تبويب «T4»."""
        text, color = self.cell("sched", fields["sched"], dim)
        # ولا يُشطب إلا وقت معروف: عنوان «⚠ خلاف» ليس موعدًا يُلغى.
        if (self.etd_cell(fields, dim)[0] and not fields["est"]["conflict"]
                and not fields["sched"]["conflict"]):
            return text, color + STRIKE
        return text, color

    def visible_flights(self, flights: list) -> list:
        """رحلات الجدول: بلا التي أقلعت ما دام الإخفاء قائمًا. والخلاف في
        الحالة لا يُخفي الرحلة، فقد لا تكون أقلعت."""
        if not self.hide_departed:
            return flights
        return [f for f in flights if not departed(f)]

    def etd_cell(self, fields: dict, dim: str) -> tuple:
        """المتوقع لا يظهر إلا إذا تغيّر موعد الإقلاع (أمر المالك ٢٠٢٦-١٠-٠٣)."""
        est, sched = fields["est"], fields["sched"]
        if not est["conflict"] and (est["value"] is None or est["value"] == sched["value"]):
            return "", dim
        return self.cell("est", est, dim)

    def table_lines(self, merged: dict, room: int) -> list:
        everything = merged["by_terminal"][self.terminal]
        flights = self.visible_flights(everything)
        if not flights:
            text = ("كل رحلات هذه الصالة أقلعت، وهي مخفية." if everything
                    else "لا رحلات بعد لهذه الصالة في هذا اليوم.")
            return [Line([(text, DIM)])]
        self.scroll = max(0, min(self.scroll, len(flights) - room))
        return [self.flight_line(f) for f in flights[self.scroll:self.scroll + room]]

    def detail_lines(self) -> list:
        flight = self.opened or {}
        f = flight["fields"]
        lines = [Line([(f"الرحلة {' / '.join(flight['nums'])}", BOLD),
                       (f"   {shown('dest', f['dest']['value'])}", "")]),
                 Line([("اضغط على القيمة الصحيحة المطابقة لموقع المطار الرسمي.", DIM)])]
        if flight.get("counter"):
            lines.append(Line([(f"الكاونتر: {flight['counter']}", "")]))
        if flight["gone"]:
            lines.append(Line([("لم يعد أي موقع يعرض هذه الرحلة؛ هذا آخر ما عُرف عنها.", YELLOW)]))
        for field in merge.FIELDS:
            result = f[field]
            title = merge.FIELD_NAMES[field]
            if result["conflict"]:
                lines.append(Line([(f"⚠ {title}: خلاف بين المواقع", YELLOW)]))
            elif result.get("auto"):
                lines.append(Line([(f"{title}: {shown(field, result['value'])} (تلقائيًا بعد موعد الإقلاع)", BOLD)]))
            elif result["chosen"]:
                how = ("مكتوبة باليد" if result.get("manual")
                       else "قاعدة شركة الطيران" if result.get("rule") else "اختيارك")
                mark = "✎" if result.get("manual") else "✓"
                lines.append(Line([(f"{mark} {title}: {shown(field, result['value'])} ({how})", GREEN)]))
            else:
                lines.append(Line([(f"{title}: {shown(field, result['value'])}", BOLD)]))
                continue
            for source, value in result["values"].items():
                if value is None:
                    continue
                mark = "  ● " if result["chosen"] and value == result["value"] else "  ○ "
                lines.append(Line([(f"{mark}{common.SOURCE_NAMES[source]}: {shown(field, value)}", "")],
                                  self.pick(flight, field, source, value)))
        lines.append(Line([("", "")]))
        lines.append(Line([("[ رجوع إلى الجدول ]", INVERT)], self.close_flight))
        return lines

    def draw(self) -> None:
        width, height = shutil.get_terminal_size((60, 30))
        self.reload()
        merged = merge.merge_day(self.state, self.day(), self.choices)
        if self.opened is not None:
            self.refresh_opened(merged)
            lines = self.detail_lines()
        else:
            lines = self.header_lines(merged)
            lines += self.table_lines(merged, height - TABLE_TOP - 1)
        lines = lines[:height - 1]
        while len(lines) < height - 1:
            lines.append(Line())
        lines.append(Line([("[ خروج ]", INVERT), ("   العجلة أو الأسهم للتمرير", DIM)], self.quit))
        self.lines = lines
        out = [ESC + "H"]
        for index, line in enumerate(lines):
            out.append(RTL + line.render(width - 1) + ESC + "K")
            if index < len(lines) - 1:
                out.append("\r\n")
        sys.stdout.write("".join(out))
        sys.stdout.flush()

    def refresh_opened(self, merged: dict) -> None:
        """يحدّث الرحلة المفتوحة من آخر بيانات، ويعرف عليها بأي رقم من أرقامها."""
        numbers = set(self.opened["nums"]) if self.opened else set()
        for flights in merged["by_terminal"].values():
            for flight in flights:
                if numbers & set(flight["nums"]):
                    self.opened = flight
                    return

    # ─── الأفعال ───

    def select_terminal(self, terminal: str) -> Callable[[], None]:
        def act() -> None:
            self.terminal, self.scroll = terminal, 0
        return act

    def toggle_departed(self) -> None:
        self.hide_departed, self.scroll = not self.hide_departed, 0

    def toggle_day(self) -> None:
        self.tomorrow, self.scroll = not self.tomorrow, 0

    def open_flight(self, flight: dict) -> Callable[[], None]:
        def act() -> None:
            self.opened = flight
        return act

    def close_flight(self) -> None:
        self.opened = None

    def pick(self, flight: dict, field: str, source: str, value: str) -> Callable[[], None]:
        def act() -> None:
            self.choose(flight, field, source, value)
        return act

    def quit(self) -> None:
        self.running = False

    # ─── الإدخال ───

    def handle(self, data: str) -> None:
        """يقرأ الضغطات والعجلة ولوحة المفاتيح."""
        index = 0
        while index < len(data):
            if data.startswith(ESC + "<", index):
                end = index + 3
                while end < len(data) and data[end] not in "Mm":
                    end += 1
                self.mouse(data[index + 3:end], data[end:end + 1])
                index = end + 1
            elif data.startswith(ESC + "A", index):
                self.scroll -= 1
                index += 3
            elif data.startswith(ESC + "B", index):
                self.scroll += 1
                index += 3
            elif data[index] in "qQ" or data[index:index + 1] == "\x1b" and index + 1 == len(data):
                if self.opened is not None:
                    self.opened = None
                else:
                    self.running = False
                index += 1
            else:
                index += 1

    def mouse(self, fields: str, kind: str) -> None:
        try:
            button, _, row = (int(part) for part in fields.split(";"))
        except ValueError:
            return
        if button == 64:
            self.scroll -= WHEEL_STEP
        elif button == 65:
            self.scroll += WHEEL_STEP
        elif button == 0 and kind == "M" and 0 < row <= len(self.lines):
            action = self.lines[row - 1].action
            if action:
                action()
        self.scroll = max(0, self.scroll)


def main() -> None:
    board = Board()
    stream = sys.stdin.fileno()
    saved = termios.tcgetattr(stream)
    sys.stdout.write(ESC + "?1049h" + ESC + "?25l" + ESC + "?1000h" + ESC + "?1006h")
    try:
        tty.setcbreak(stream)
        while board.running:
            board.draw()
            ready, _, _ = select.select([stream], [], [], 1.0)
            if ready:
                board.handle(os.read(stream, 1024).decode("utf-8", "ignore"))
    finally:
        termios.tcsetattr(stream, termios.TCSADRAIN, saved)
        sys.stdout.write(ESC + "?1006l" + ESC + "?1000l" + ESC + "?25h"
                         + ESC + "0 k" + ESC + "?1049l")
        sys.stdout.flush()


if __name__ == "__main__":
    main()
