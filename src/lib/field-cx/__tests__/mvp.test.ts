import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEFERRED,
  MVP_MODULES,
  SUCCESS_CRITERIA,
  isMvpModule,
} from "../mvp";
import { DEFAULT_MODULE_STATE, FIELD_CX_MODULES } from "../fixtures";

/**
 * 最小構成が、放っておくと膨らむのを止める。
 *
 * 機能は「足す理由」がいつでもあり、「足さない理由」は忘れられる。
 * だから外した理由と戻す条件を書かせ、既定がそこからずれたら落とす。
 */

describe("既定の構成 = 最小構成", () => {
  it("既定でオンになっているのは MVP のモジュールだけ", () => {
    const on = Object.entries(DEFAULT_MODULE_STATE)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .sort();
    expect(on).toEqual([...MVP_MODULES].sort());
  });

  it("MVP は3つ以下（増やすなら、何を外すか先に決める）", () => {
    expect(MVP_MODULES.length).toBeLessThanOrEqual(3);
  });

  it("コアのモジュールは MVP に入っている（オフにできないため）", () => {
    for (const m of FIELD_CX_MODULES.filter((x) => x.core)) {
      expect(isMvpModule(m.id), `${m.id} は core なのに MVP 外`).toBe(true);
    }
  });

  it("検査の翻訳は MVP に入っている（これが検証したい仮説そのもの）", () => {
    expect(isMvpModule("labtest")).toBe(true);
  });
});

describe("外したものには、理由と戻す条件がある", () => {
  it("先送りの一覧が空でない（何も外していないなら最小ではない）", () => {
    expect(DEFERRED.length).toBeGreaterThanOrEqual(5);
  });

  it.each(DEFERRED.map((d) => [d.id, d] as const))(
    "%s に理由と戻す条件が書いてある",
    (_id, item) => {
      expect(item.why.length, "why が短すぎる").toBeGreaterThan(15);
      expect(
        item.bringBackWhen.length,
        "bringBackWhen が短すぎる",
      ).toBeGreaterThan(10);
    },
  );

  it("id が重複していない", () => {
    const ids = DEFERRED.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("『後で』だけの理由を許さない", () => {
    for (const d of DEFERRED) {
      expect(d.why, d.id).not.toMatch(/^(後で|あとで|later)/);
    }
  });
});

describe("成功の条件が先に決まっている", () => {
  it("指標がある（無いと、何をもって検証終了か決まらない）", () => {
    expect(SUCCESS_CRITERIA.length).toBeGreaterThanOrEqual(3);
  });

  it.each(SUCCESS_CRITERIA.map((c) => [c.id, c] as const))(
    "%s に数値目標がある",
    (_id, c) => {
      // 「たくさん」ではなく、割合か件数で書かれていること。
      expect(c.target).toMatch(/\d/);
    },
  );

  it("最後は有償化の意思で締める（それだけが本当の検証）", () => {
    expect(SUCCESS_CRITERIA[SUCCESS_CRITERIA.length - 1].id).toBe(
      "willingness",
    );
  });
});

describe("ナビが最小に保たれている", () => {
  const SRC = join(process.cwd(), "src");

  function navHrefs(file: string): string[] {
    const body = readFileSync(join(SRC, file), "utf8");
    return Array.from(body.matchAll(/href:\s*"([^"]+)"/g)).map((m) => m[1]);
  }

  it("店舗の管理画面のサイドバーは5項目以下", () => {
    const hrefs = navHrefs("app/(admin)/admin/layout.tsx");
    // sidebar + mobile の両方を数えるので、重複を除いた実数で見る。
    expect(new Set(hrefs).size).toBeLessThanOrEqual(5);
  });

  it("患者のタブは2つ（増やすと、続いた理由が分からなくなる）", () => {
    const hrefs = navHrefs("app/(client)/c/layout.tsx");
    expect(hrefs).toEqual(["/c/progress", "/c/guide"]);
  });

  it("先送りにした画面がナビに出ていない", () => {
    const all = [
      ...navHrefs("app/(admin)/admin/layout.tsx"),
      ...navHrefs("app/(therapist)/t/layout.tsx"),
      ...navHrefs("app/(client)/c/layout.tsx"),
    ];
    const deferredPaths = [
      "/admin/cases",
      "/admin/at-risk",
      "/admin/evidence",
      "/admin/billing",
      "/admin/dashboard",
      "/c/learn",
      "/c/skin",
      "/t/cases",
    ];
    for (const path of deferredPaths) {
      expect(all, `${path} がナビに残っている`).not.toContain(path);
    }
  });
});
