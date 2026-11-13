"""common.py — أدوات مشتركة: المسارات، ووقت الرياض، والكتابة الآمنة، والسجل.

السجل محدود الحجم عمدًا: في مشروع الصالة الشمالية بلغ السجل ١٦ ميجا يوميًا
لأنه بلا سقف. هنا ملف واحد لا يتجاوز SIZE_LIMIT، ثم يُنقل إلى نسخة سابقة
واحدة ويبدأ من جديد، فلا يتجاوز مجموعهما ضعف السقف.

يعمل على بايثون 3.9 الموجود في الجهاز.
"""

from __future__ import annotations

import datetime
import json
import os
import tempfile
from typing import Any
from zoneinfo import ZoneInfo

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# ملفات التشغيل كلها في مجلد واحد منفصل عن الشيفرة.
DATA_DIR = os.path.join(BASE_DIR, "بيانات")
STATE_FILE = os.path.join(DATA_DIR, "state.json")
CHOICES_FILE = os.path.join(DATA_DIR, "choices.json")
LOG_FILE = os.path.join(DATA_DIR, "log.jsonl")
LOCK_FILE = os.path.join(DATA_DIR, "collector.lock")
SIZE_LIMIT = 1_000_000
RIYADH = ZoneInfo("Asia/Riyadh")

# الصالات المطلوبة وحدها، بالرمز الموحّد الذي يُحوَّل إليه رمز كل موقع.
WANTED = ("N", "1", "4")
TERMINAL_NAMES = {"N": "الصالة الشمالية", "1": "صالة ١", "4": "صالة ٤"}
SOURCE_NAMES = {"ixigo": "إكسيجو", "jeddah": "جدة إيربورت", "kupi": "كوبي",
                "aerodatabox": "إيرو داتا بوكس"}
# مواقع أُوقف جلبها. ما رُئي منها قبل الإيقاف يبقى ظاهرًا رحلةً اختفت، ولا يدخل
# المقارنة ما دام موقع عامل يعرض الرحلة. إكسيجو: شروطه تمنع الجمع الآلي،
# وأوقفه المالك في ٢٠٢٦-١٠-٠٥.
STOPPED_SOURCES = ("ixigo",)


def now() -> datetime.datetime:
    """الوقت الآن بتوقيت الرياض، وهو توقيت جدة."""
    return datetime.datetime.now(RIYADH)


def today() -> datetime.date:
    """تاريخ اليوم بتوقيت جدة لا بتوقيت الخادم."""
    return now().date()


def stamp() -> str:
    """طابع وقت مقروء للسجل والحالة."""
    return now().strftime("%Y-%m-%d %H:%M:%S")


def write_json(path: str, data: Any) -> None:
    """يكتب في ملف مؤقت ثم يستبدل به الأصل دفعة واحدة.

    فلو انقطع البرنامج في منتصف الكتابة بقي الملف القديم سليمًا، ولا يقرأ
    القارئ ملفًا نصف مكتوب.
    """
    folder = os.path.dirname(path)
    handle, temporary = tempfile.mkstemp(dir=folder, suffix=".tmp")
    with os.fdopen(handle, "w", encoding="utf-8") as stream:
        json.dump(data, stream, ensure_ascii=False)
    os.replace(temporary, path)


def read_json(path: str, default: Any) -> Any:
    """يقرأ ملفًا، ويعيد القيمة الافتراضية إن لم يوجد أو كان تالفًا."""
    try:
        with open(path, encoding="utf-8") as stream:
            return json.load(stream)
    except (OSError, ValueError):
        return default


def log(event: str, details: Any = None) -> None:
    """سطر واحد في السجل لكل حدث، مع حدّ أعلى لحجم الملف."""
    try:
        if os.path.getsize(LOG_FILE) > SIZE_LIMIT:
            os.replace(LOG_FILE, LOG_FILE + ".1")
    except OSError:
        pass
    line = json.dumps({"الوقت": stamp(), "الحدث": event, "التفاصيل": details},
                      ensure_ascii=False)
    with open(LOG_FILE, "a", encoding="utf-8") as stream:
        stream.write(line + "\n")
