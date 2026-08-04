#!/usr/bin/env python3
"""プロダクト名を変える。

    python3 scripts/rename-product.py "Vitality Design" "New Name"
    python3 scripts/rename-product.py "Vitality Design" "New Name" --check   # 下見だけ

名前は5つの形で散らばっている。表示名だけ直しても、
識別子・ファイル名・URLスラッグに旧称が残る。
残った旧称は、あとから見つけるのが難しい（import パスの中など）。

以前この作業を手でやったときに踏んだ落とし穴を、全部ここに閉じ込めてある:

  1. **置換の順番**
     短い kebab を先に当てると VitalityDesignModuleId のような識別子が壊れる。
     PascalCase → SCREAMING_SNAKE → snake → kebab → 表示名 の順に当てる。

  2. **日本語に接する表示名**
     「Accordは」「Accord内」は \\b が立たないので、正規表現の単語境界に
     頼ると取りこぼす。表示名は境界なしで置換する
     （according / accordion のような巻き込みが無いことを先に確認する）。

  3. **ハイフンを含むオブジェクトキー**
     `accord:` が `vitality-design:` になると、そのままでは構文エラー。
     引用符が要るので、置換後に検出して報告する。

  4. **localStorage の名前空間**
     `accord-demo-v1` → `vitality-design-demo-v1` に変わり、
     既存のデモデータは引き継がれない。改名なので意図どおりだが、黙って消さない。
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

EXTS = {".ts", ".tsx", ".css", ".md", ".sql", ".json", ".sh", ".py"}
ROOTS = ["src", "docs", "supabase", "scripts"]
SKIP_DIRS = {"node_modules", ".next", ".git"}


class Name:
    """ひとつの名前を、コードに現れる5つの形に展開する。"""

    def __init__(self, display: str) -> None:
        self.display = display.strip()
        words = [w for w in re.split(r"[\s_-]+", self.display) if w]
        self.pascal = "".join(w[:1].upper() + w[1:].lower() for w in words)
        self.kebab = "-".join(w.lower() for w in words)
        self.snake = "_".join(w.lower() for w in words)
        self.screaming = "_".join(w.upper() for w in words)

    def __str__(self) -> str:
        return (
            f"表示名={self.display} / Pascal={self.pascal} / "
            f"kebab={self.kebab} / snake={self.snake} / SCREAMING={self.screaming}"
        )


def collect_files() -> list[Path]:
    out: list[Path] = []
    for root in ROOTS:
        base = Path(root)
        if not base.exists():
            continue
        for p in base.rglob("*"):
            if any(part in SKIP_DIRS for part in p.parts):
                continue
            if p.is_file() and p.suffix in EXTS:
                out.append(p)
    return out


def build_rules(old: Name, new: Name) -> list[tuple[re.Pattern[str], str]]:
    """置換規則。**順番が意味を持つ**ので、並べ替えないこと。"""
    return [
        # 1) PascalCase の識別子。後ろに大文字が続く形を先に潰す
        (re.compile(rf"\b{re.escape(old.pascal)}(?=[A-Z])"), new.pascal),
        (re.compile(rf"\b{re.escape(old.pascal)}\b"), new.pascal),
        # 2) SCREAMING_SNAKE
        (re.compile(rf"{re.escape(old.screaming)}_"), f"{new.screaming}_"),
        (re.compile(rf"\b{re.escape(old.screaming)}\b"), new.screaming),
        # 3) snake_case
        (re.compile(rf"{re.escape(old.snake)}_"), f"{new.snake}_"),
        # 4) kebab（パス・スラッグ・CSS変数・localStorage 名前空間）
        (re.compile(re.escape(old.kebab)), new.kebab),
        # 5) 表示名。**境界を使わない** — 日本語に接する形を拾うため
        (re.compile(re.escape(old.display)), new.display),
    ]


def preflight(old: Name) -> list[str]:
    """巻き込み事故になりそうな語を先に洗い出す。"""
    warnings: list[str] = []
    stem = old.kebab.split("-")[0]
    if len(stem) < 4:
        return warnings

    # 旧称そのものの派生（VitalityDesignModuleId など）は規則が正しく扱うので除く。
    # 残るのは「たまたま同じ語で始まる無関係な語」だけ。そこだけ人に見せる。
    known = {old.kebab, old.snake, old.pascal.lower(), old.display.lower().replace(" ", "")}
    pat = re.compile(rf"\b{re.escape(stem)}[a-z]{{2,}}", re.I)
    hits: set[str] = set()
    for p in collect_files():
        for m in pat.finditer(p.read_text(encoding="utf-8", errors="ignore")):
            word = m.group(0).lower()
            if any(word.startswith(k) for k in known) or word == stem:
                continue
            hits.add(word)
    for w in sorted(hits):
        warnings.append(
            f'"{w}" は "{stem}" で始まる別の語です。'
            "置換規則には掛かりませんが、目視で確認してください"
        )
    return warnings


def rename_dirs(old: Name, new: Name, check: bool) -> list[str]:
    """ディレクトリとファイル名。git mv で履歴を残す。"""
    moved: list[str] = []
    targets: list[Path] = []
    for root in ROOTS:
        base = Path(root)
        if not base.exists():
            continue
        for p in base.rglob(f"*{old.kebab}*"):
            if any(part in SKIP_DIRS for part in p.parts):
                continue
            targets.append(p)
    # 深いものから動かす（親を先に動かすとパスが変わる）
    for p in sorted(targets, key=lambda x: len(x.parts), reverse=True):
        dst = p.parent / p.name.replace(old.kebab, new.kebab)
        moved.append(f"{p} → {dst}")
        if not check:
            subprocess.run(["git", "mv", str(p), str(dst)], check=True)
    return moved


def find_broken_keys(new: Name) -> list[str]:
    """ハイフン入りの識別子が、引用符なしのオブジェクトキーになっていないか。"""
    if "-" not in new.kebab:
        return []
    pat = re.compile(rf"^\s*{re.escape(new.kebab)}\s*:", re.M)
    out: list[str] = []
    for p in collect_files():
        if p.suffix not in {".ts", ".tsx"}:
            continue
        for m in pat.finditer(p.read_text(encoding="utf-8", errors="ignore")):
            line = p.read_text(encoding="utf-8").count("\n", 0, m.start()) + 1
            out.append(f"{p}:{line} — 引用符が要ります: \"{new.kebab}\":")
    return out


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    check = "--check" in sys.argv
    if len(args) != 2:
        print(__doc__)
        return 2

    old, new = Name(args[0]), Name(args[1])
    print(f"旧: {old}")
    print(f"新: {new}")
    print(f"モード: {'下見のみ（書き換えません）' if check else '実行'}\n")

    for w in preflight(old):
        print(f"  ⚠ {w}")

    rules = build_rules(old, new)
    files = collect_files()
    changed = 0
    for p in files:
        s = original = p.read_text(encoding="utf-8")
        for pat, rep in rules:
            s = pat.sub(rep, s)
        if s != original:
            changed += 1
            if not check:
                p.write_text(s, encoding="utf-8")
    print(f"  書き換え対象: {changed} ファイル")

    for line in rename_dirs(old, new, check):
        print(f"  移動: {line}")

    if not check:
        broken = find_broken_keys(new)
        for b in broken:
            print(f"  ⚠ {b}")

    print(
        "\n  注意: localStorage の名前空間が変わるため、"
        f"既存のデモデータ（{old.kebab}-demo-v1）は引き継がれません。"
    )
    print("\n  このあと必ず、この順番で実行してください:")
    # .next を先に消す。古い生成型が残っていると、旧パスを参照して
    # tsc が誤って落ちる（改名が失敗したように見えて、原因を探しにくい）。
    print("    rm -rf .next")
    print("    npx tsc --noEmit && npx eslint src && npx vitest run")
    print("    ./scripts/verify-migrations.sh")
    print("    npx next build")
    print(f'    grep -ri "{old.kebab}" src docs supabase   # 0件になること')
    return 0


if __name__ == "__main__":
    sys.exit(main())
