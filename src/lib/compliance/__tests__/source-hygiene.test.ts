import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * ソースの衛生 — 一度直したものが、静かに戻ってこないようにする。
 *
 * 監査（docs/accord/audit-2026-08.md）で「テストで再混入を検知する」と
 * 書いた約束を、ここで実際に果たす。
 *
 * 1) 実在名の再混入: 医療機関名・店舗名・担当者名は全て非掲載にした。
 *    画面文言だけでなく識別子・URLスラッグ・コメントまで含めて禁止する。
 * 2) タップ領域の仕組み: 密なUIの当たり判定を 44px に広げる .tap-44 と、
 *    Button size="sm" の擬似要素。どちらも「見た目を変えない」ため、
 *    見た目のレビューでは消えたことに気づけない。存在をテストで固定する。
 */

const SRC = join(process.cwd(), "src");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (/\.(ts|tsx|css)$/.test(name) && !/__tests__/.test(full)) {
      // テストは「禁止語そのもの」を書いて守るので、走査対象から外す。
      out.push(full);
    }
  }
  return out;
}

const FILES = walk(SRC);

/** 非掲載にした実在名。表記ゆれ（カタカナ / ローマ字）も並べる。 */
const REAL_NAMES = [
  "エクシア",
  "exia",
  "なめらかせなか",
  "namerakasenaka",
  "田村",
];

describe("実在名は非掲載のままであること", () => {
  it.each(REAL_NAMES)("src/ のどこにも %s が現れない", (needle) => {
    const lower = needle.toLowerCase();
    const offenders = FILES.filter((f) =>
      readFileSync(f, "utf8").toLowerCase().includes(lower),
    ).map((f) => f.slice(SRC.length + 1));
    expect(offenders, `${needle} が残っている: ${offenders.join(", ")}`).toEqual(
      [],
    );
  });
});

describe("タップ領域 44px の仕組みが残っていること", () => {
  const globals = readFileSync(join(SRC, "app/globals.css"), "utf8");

  it(".tap-44 は 44px の当たり判定を擬似要素で作る", () => {
    expect(globals).toContain(".tap-44");
    const block = globals.slice(globals.indexOf(".tap-44::after"));
    expect(block).toContain("position: absolute");
    expect(block).toContain("height: 44px");
    expect(block).toContain("min-width: 44px");
  });

  it("Button の sm サイズは見た目 36px・当たり判定 44px を保つ", () => {
    const button = readFileSync(join(SRC, "components/ui/button.tsx"), "utf8");
    const sm = button.slice(button.indexOf("sm:"), button.indexOf("sm:") + 200);
    expect(sm).toContain("h-9");
    expect(sm).toContain("after:-inset-y-1");
  });

  it("スタッフのサイドバーは iPad でも 44px を割らない", () => {
    const nav = readFileSync(join(SRC, "components/ui/nav.tsx"), "utf8");
    expect(nav).toContain("min-h-11");
  });
});

describe("顧客画面に入力欄を戻さないこと", () => {
  /**
   * 「顧客が記録しないでいい体制」— やりとりは LINE で完結し、
   * Web は見るだけ。顧客ルート配下のページに入力系のタグが現れたら、
   * その原則が崩れたということ。
   */
  const CLIENT_DIR = join(SRC, "app/(client)/c");
  const clientFiles = walk(CLIENT_DIR);

  it.each(clientFiles.map((f) => f.slice(SRC.length + 1)))(
    "%s に入力欄が無い",
    (rel) => {
      const body = readFileSync(join(SRC, rel), "utf8");
      const hits = ["<input", "<textarea", "<Input", "<Textarea"].filter((t) =>
        body.includes(t),
      );
      expect(hits, `${rel}: ${hits.join(", ")}`).toEqual([]);
    },
  );
});
