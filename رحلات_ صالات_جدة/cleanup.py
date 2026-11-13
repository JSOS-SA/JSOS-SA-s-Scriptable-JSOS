"""cleanup.py — يحذف تلقائيًا كل رحلة مضت ٦ ساعات على موعد إقلاعها.

بأمر صاحب المشروع ٢٠٢٦-١٠-٠٥، وكان قبله ٧ ساعات بشرط «أقلعت» متفق عليها:
- حين يبلغ العداد ٠٠:٠٠ تصير الحالة «أقلعت» تلقائيًا (في الدمج)، فلا يمنع
  خلاف المواقع في الحالة الحذف بعد ذلك.
- موعد الإقلاع هو الوقت المتوقع إن عُرف، وإلا المجدول. وإن اختلفت المواقع
  في الوقت يؤخذ أبعد الأوقات، فلا تُحذف رحلة قبل أوانها.
- والملغاة والمحوّلة تُحذف كذلك بعد ٦ ساعات من موعدها.

والرحلة المحذوفة تُسجَّل في قائمة «المحذوفة» ليومها، فلا تعود حين تعرضها
المواقع في الجلب التالي، وتُمحى سجلاتها من ملف الحالة. ويُسجَّل كل حذف في
السجل. وتُنسى القائمة مع أيامها حين تمضي.
"""

from __future__ import annotations

import datetime

import common
import merge

HOURS_AFTER = 6
DEPARTED = merge.DEPARTED
departure_moment = merge.departure_moment


def should_remove(day: str, flight: dict, now: datetime.datetime) -> bool:
    """هل مضت ٦ ساعات على موعد إقلاع الرحلة؟"""
    moment = departure_moment(day, flight)
    return moment is not None and now - moment >= datetime.timedelta(hours=HOURS_AFTER)


def forget(state: dict, day: str, numbers: set) -> None:
    """يمحو سجلات الرحلة من ملف الحالة في كل موقع."""
    for records in state.get("seen", {}).get(day, {}).values():
        for key in [k for k, row in records.items() if numbers & set(row["nums"])]:
            del records[key]
    for days in state.get("current", {}).values():
        if day in days:
            days[day] = [row for row in days[day] if not numbers & set(row["nums"])]


def sweep(state: dict, choices: dict, now: datetime.datetime) -> list:
    """يمر على كل الأيام المحفوظة ويحذف ما تحققت فيه الشروط."""
    removed_now = []
    removed = state.setdefault("removed", {})
    for day in sorted(state.get("seen", {})):
        merged = merge.merge_day(state, day, choices, now)
        done: set = set()
        for flights in merged["by_terminal"].values():
            for flight in flights:
                numbers = set(flight["nums"])
                if numbers & done or not should_remove(day, flight, now):
                    continue
                done |= numbers
                listed = removed.setdefault(day, [])
                listed.extend(sorted(numbers - set(listed)))
                forget(state, day, numbers)
                removed_now.append({"اليوم": day, "الرحلة": sorted(numbers)})
    for day in [d for d in removed if d not in state.get("seen", {})]:
        del removed[day]
    if removed_now:
        common.log("حذف رحلات مضى على موعد إقلاعها ٦ ساعات", removed_now)
    return removed_now
