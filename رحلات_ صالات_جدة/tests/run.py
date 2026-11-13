"""يشغّل الاختبارات على بايثون الجهاز نفسه (3.9) بلا أي أداة مثبتة: python3 tests/run.py"""

import importlib.util
import os
import sys
import traceback

HERE = os.path.dirname(os.path.abspath(__file__))
names = []
failed = 0
# كل ملف test_*.py في هذا المجلد، بترتيب أسمائه.
for file in sorted(f for f in os.listdir(HERE) if f.startswith("test_") and f.endswith(".py")):
    spec = importlib.util.spec_from_file_location(file[:-3], os.path.join(HERE, file))
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    tests = sorted(name for name in dir(module) if name.startswith("test_"))
    names += tests
    for name in tests:
        try:
            getattr(module, name)()
            print("✓", name)
        except Exception:  # noqa: BLE001 — يُعرض كل فشل ويُكمل الباقي
            failed += 1
            print("✗", name)
            traceback.print_exc(limit=3)
print(f"{len(names) - failed} من {len(names)} نجحت")
sys.exit(1 if failed else 0)
