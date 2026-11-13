#!/bin/bash
# يفتح شاشة الرحلات. الجمع تتولاه الخدمة الدائمة، وتعمل حتى لو أُغلقت الشاشة.
cd "$(dirname "$0")" || exit 1
exec xfce4-terminal --title="رحلات الصالات" --working-directory="$PWD" -x python3 board.py
