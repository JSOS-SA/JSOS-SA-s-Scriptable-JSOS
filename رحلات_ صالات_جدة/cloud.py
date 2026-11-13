"""cloud.py — رفع الرحلات المدموجة إلى قاعدة فايربيس المستقلة، ومزامنة الاختيارات.

القرار والمقارنة مع كلاود فلير في `وثائق/الذاكرة.md` (٢٠٢٦-١٠-٠٣).

شكل القاعدة: لكل يوم فرع، وداخله ثلاث عُقد منفصلة للصالات (N و1 و4) فلا
تختلط. كل رحلة عقدة بمفتاح أول أرقامها، وعليها ختم تحديث «u».

الجوال ينزّل الصالة كاملة أول مرة، ثم يطلب الرحلات التي ختمها أحدث مما عنده
فقط، فتبقى القائمة كاملة ويصل كل تغيير، ويبقى التنزيل تحت الحد المجاني
(١٠ جيجا في الشهر بنص صفحة الأسعار).

الصيغة المختصرة: المعلومة المتفق عليها تُرفع بقيمتها وحدها، ولا تُرفع قيم
المواقع إلا عند الخلاف أو الاختيار.
"""

from __future__ import annotations

import base64
import hashlib
import json
import os
import re
import time
from collections.abc import Callable
from typing import Any

import common
import merge

KEY_DIR = os.path.join(common.BASE_DIR, "مفاتيح")
KEY_FILE = os.path.join(KEY_DIR, "service-account.json")
CONFIG_FILE = os.path.join(KEY_DIR, "cloud.json")
MEMORY_FILE = os.path.join(common.DATA_DIR, "cloud_memory.json")
# النطاقان المطلوبان لدخول حساب الخدمة إلى القاعدة، بنص صفحة «الدخول عبر REST».
SCOPES = ("https://www.googleapis.com/auth/userinfo.email "
          "https://www.googleapis.com/auth/firebase.database")
TIMEOUT = 30
TOMBSTONE = "x"
KEY_CLEAN = re.compile(r"[^A-Z0-9]")

with open(os.path.join(common.BASE_DIR, "airports_ar.json"), encoding="utf-8") as _f:
    AIRPORTS = json.load(_f)


# ═══ الصيغة المختصرة ═══

def compact_field(result: dict) -> dict:
    """المعلومة مختصرة: القيمة وحالتها، وقيم المواقع عند غير الاتفاق."""
    if result["conflict"]:
        state = "conflict"
    elif result.get("manual"):
        state = "manual"
    elif result.get("rule"):
        state = "rule"
    elif result.get("auto"):
        state = "auto"
    elif result["chosen"]:
        state = "chosen"
    else:
        return {"v": result["value"], "st": "agreed"}
    sites = {s: v for s, v in result["values"].items() if v is not None}
    return {"v": result["value"], "st": state, "s": sites}


def city_names(flight: dict) -> dict:
    """أسماء المدن بالعربية لكل رمز وجهة في الرحلة، كما تعرضها الطرفية."""
    result = flight["fields"]["dest"]
    codes = {result["value"], *result["values"].values()} - {None}
    return {code: AIRPORTS[code] for code in sorted(codes) if code in AIRPORTS}


def compact_day(merged: dict) -> dict:
    """رحلات اليوم لكل صالة، بمفتاح هو أول رقم للرحلة."""
    out: dict = {}
    for terminal, flights in merged["by_terminal"].items():
        nodes = {}
        for flight in flights:
            node = {
                "n": flight["nums"], "sh": flight["showing"], "g": flight["gone"],
                "c": flight["counter"],
                "f": {f: compact_field(flight["fields"][f]) for f in merge.FIELDS},
            }
            names = city_names(flight)
            if names:
                node["dn"] = names
            nodes[KEY_CLEAN.sub("", flight["nums"][0])] = node
        out[terminal] = nodes
    return out


def node_hash(obj) -> str:
    """بصمة قصيرة تعرف بها أن الرحلة تغيّرت."""
    text = json.dumps(obj, ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(text.encode()).hexdigest()[:8]


# ═══ دخول حساب الخدمة ═══

def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def access_token(key: dict, now: int, session: Any) -> tuple:
    """رمز دخول لساعة: (الرمز، وقت انتهائه). توقيع محلي بلا مكتبة جوجل."""
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import padding
    header = _b64(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
    claim = _b64(json.dumps({"iss": key["client_email"], "scope": SCOPES,
                             "aud": key["token_uri"], "iat": now,
                             "exp": now + 3600}).encode())
    private: Any = serialization.load_pem_private_key(key["private_key"].encode(),
                                                      password=None)
    signature = _b64(private.sign(f"{header}.{claim}".encode(),
                                  padding.PKCS1v15(), hashes.SHA256()))
    response = session.post(key["token_uri"], timeout=TIMEOUT, data={
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": f"{header}.{claim}.{signature}"})
    response.raise_for_status()
    data = response.json()
    return data["access_token"], now + int(data.get("expires_in", 3600))


class TokenKeeper:
    """يحفظ الرمز ويجدّده قبل انتهائه بخمس دقائق."""

    def __init__(self, key: dict, session: Any) -> None:
        self.key, self.session = key, session
        self.value, self.expires = "", 0

    def __call__(self) -> str:
        now = int(time.time())
        if now > self.expires - 300:
            self.value, self.expires = access_token(self.key, now, self.session)
        return self.value


# ═══ الرفع: المتغيّر فقط ═══

class Uploader:
    """يرفع الرحلات التي تغيّرت وحدها، وعلى كل رحلة ختم تحديث «u».

    الرحلة التي خرجت من صالة تُكتب علامة خروج {x, u} لا حذفًا، حتى يعرف
    الجوال بخروجها. وتُمحى الأيام التي مضت كاملة، كما يُمحى أمس من الحالة.
    """

    def __init__(self, database_url: str, token: Callable[[], str], session: Any,
                 memory_file: str | None = None) -> None:
        self.url = database_url.rstrip("/")
        self.token, self.session, self.memory_file = token, session, memory_file
        memory = common.read_json(memory_file, {}) if memory_file else {}
        self.hashes: dict = memory.get("hashes", {})
        self.stamps: dict = memory.get("stamps", {})

    def patch(self, path: str, updates: dict) -> None:
        response = self.session.patch(f"{self.url}/{path}.json",
                                      data=json.dumps(updates, ensure_ascii=False).encode(),
                                      params={"access_token": self.token()},
                                      timeout=TIMEOUT)
        response.raise_for_status()

    def push(self, state: dict, choices: dict, days: list, now_ms: int) -> dict:
        """يبني التحديثات ويرسلها بطلب واحد، ويعيد ما أُرسل."""
        updates: dict = {}
        hashes = dict(self.hashes)
        stamps = {day: dict(t) for day, t in self.stamps.items()}
        no_terminal = {}
        for day in days:
            merged = merge.merge_day(state, day, choices)
            no_terminal[day] = merged["no_terminal"]
            for terminal, nodes in compact_day(merged).items():
                prefix = f"{day}|{terminal}|"
                before = {k[len(prefix):] for k in hashes if k.startswith(prefix)}
                for key, node in nodes.items():
                    digest = node_hash(node)
                    if hashes.get(prefix + key) != digest:
                        updates[f"days/{day}/{terminal}/{key}"] = dict(node, u=now_ms)
                        hashes[prefix + key] = digest
                        stamps.setdefault(day, {})[terminal] = now_ms
                for key in before - set(nodes):
                    if hashes[prefix + key] != TOMBSTONE:
                        updates[f"days/{day}/{terminal}/{key}"] = {"x": 1, "u": now_ms}
                        hashes[prefix + key] = TOMBSTONE
                        stamps.setdefault(day, {})[terminal] = now_ms
        for day in {k.split("|")[0] for k in hashes} - set(days):
            updates[f"days/{day}"] = None
            hashes = {k: v for k, v in hashes.items() if not k.startswith(day + "|")}
            stamps.pop(day, None)
        updates["meta/u"] = {day: {t: stamps.get(day, {}).get(t, 0) for t in common.WANTED}
                             for day in days}
        updates["meta/no_terminal"] = no_terminal
        updates["meta/sources"] = state.get("sources", {})
        updates["meta/updated"] = common.stamp()
        self.patch("jed", updates)
        self.hashes, self.stamps = hashes, stamps
        if self.memory_file:
            common.write_json(self.memory_file, {"hashes": hashes, "stamps": stamps})
        return updates

    def sync_choices(self, choices_file: str) -> dict:
        """يدمج اختيارات الجوالات واختيارات الطرفية، والأحدث يغلب، ولا حذف."""
        response = self.session.get(f"{self.url}/jed/choices.json",
                                    params={"access_token": self.token()},
                                    timeout=TIMEOUT)
        response.raise_for_status()
        local = common.read_json(choices_file, {})
        merged, to_upload = merge_choices(local, response.json() or {})
        if merged != local:
            # يُعاد الدمج على آخر نسخة من الملف، فقد تكون الطرفية كتبت فيه للتو.
            latest = common.read_json(choices_file, {})
            for key, entry in merged.items():
                if newer(entry, latest.get(key)):
                    latest[key] = entry
            common.write_json(choices_file, latest)
            merged = latest
        if to_upload:
            self.patch("jed/choices", {
                key.replace("|", "/"): {"value": e["value"], "source": e.get("source"),
                                        "at": e.get("at_ms", 0)}
                for key, e in to_upload.items()})
        return merged


def newer(entry: dict, other: dict | None) -> bool:
    """هل الاختيار الأول أحدث من الثاني؟ الاختيار بلا ختم أقدم من كل مختوم."""
    return other is None or entry.get("at_ms", 0) > other.get("at_ms", 0)


def remote_entry(remote: dict, key: str) -> dict | None:
    """ختم اختيار السحابة لمفتاح محلي، بالصيغة المستعملة في المقارنة."""
    day, number, field = key.split("|")
    entry = ((remote.get(day) or {}).get(number) or {}).get(field)
    if not isinstance(entry, dict):
        return None
    return {"at_ms": int(entry.get("at") or 0)}


def merge_choices(local: dict, remote: dict) -> tuple:
    """دمج بلا حذف: (الدمج الكامل، وما يُرفع لأن المحلي أحدث أو غائب عن السحابة)."""
    merged = dict(local)
    seen = set()
    for day, numbers in remote.items():
        for number, fields in (numbers or {}).items():
            for field, entry in (fields or {}).items():
                if not isinstance(entry, dict) or not entry.get("value"):
                    continue
                key = merge.choice_key(day, number, field)
                seen.add(key)
                incoming = {"value": entry["value"], "source": entry.get("source"),
                            "at_ms": int(entry.get("at") or 0)}
                if newer(incoming, merged.get(key)):
                    merged[key] = incoming
    to_upload = {key: entry for key, entry in merged.items()
                 if key not in seen or newer(entry, remote_entry(remote, key))}
    return merged, to_upload


def connect(session: Any) -> Uploader | None:
    """الرافع جاهزًا، أو لا شيء إن لم توجد المفاتيح فيبقى البرنامج كما كان."""
    if not (os.path.exists(KEY_FILE) and os.path.exists(CONFIG_FILE)):
        return None
    key = common.read_json(KEY_FILE, {})
    url = common.read_json(CONFIG_FILE, {}).get("database_url")
    if not key or not url:
        return None
    return Uploader(url, TokenKeeper(key, session), session, MEMORY_FILE)
