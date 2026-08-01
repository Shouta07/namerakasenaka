import { describe, expect, it } from "vitest";
import { containsBannedWord } from "@/lib/compliance/banned-words";
import {
  FOOD_REACTIONS,
  JOURNEY,
  LABTEST_DISCLAIMER,
  LAB_ROWS,
  LAB_TRANSLATIONS,
  RETEST_TALK,
  ROTATION_PLAN,
  judgeLab,
  labChange,
} from "../labtest-fixtures";

describe("labChange — 継続提案で言い違えてはいけない区別", () => {
  const base = {
    id: "x",
    category: "c",
    name: "n",
    unit: "u",
    refMin: 10,
    refMax: 40,
    optMin: 20,
    optMax: 30,
    note: "",
  };

  it("適正外から適正に入ったら entered", () => {
    expect(labChange({ ...base, first: 14, retest: 25 }).kind).toBe("entered");
  });

  it("もともと適正で、動いても適正のままなら held（入った、とは言わない）", () => {
    const c = labChange({ ...base, first: 24, retest: 22 });
    expect(c.kind).toBe("held");
    expect(c.label).not.toContain("入りました");
  });

  it("まだ適正外でも、距離が縮んでいれば closer", () => {
    expect(labChange({ ...base, first: 12, retest: 18 }).kind).toBe("closer");
  });

  it("遠ざかったら farther — 良くなったことにしない", () => {
    expect(labChange({ ...base, first: 18, retest: 12 }).kind).toBe("farther");
  });

  it("同値なら same", () => {
    expect(labChange({ ...base, first: 18, retest: 18 }).kind).toBe("same");
  });
});

describe("judgeLab — 基準範囲と適正範囲の二段判定", () => {
  const row = { refMin: 21, refMax: 277, optMin: 80, optMax: 200 };

  it("適正範囲の中は optimal", () => {
    expect(judgeLab(row, 120)).toBe("optimal");
    expect(judgeLab(row, 80)).toBe("optimal");
    expect(judgeLab(row, 200)).toBe("optimal");
  });

  it("基準内でも適正から外れていれば watch — この画面の存在理由", () => {
    expect(judgeLab(row, 42)).toBe("watch");
    expect(judgeLab(row, 260)).toBe("watch");
  });

  it("基準範囲の外は out", () => {
    expect(judgeLab(row, 18)).toBe("out");
    expect(judgeLab(row, 300)).toBe("out");
  });
});

describe("血液検査フィクスチャの整合性", () => {
  it("適正範囲は基準範囲の中に収まっている", () => {
    for (const r of LAB_ROWS) {
      expect(r.refMin, `${r.name}: refMin < refMax`).toBeLessThan(r.refMax);
      expect(r.optMin, `${r.name}: optMin < optMax`).toBeLessThan(r.optMax);
      expect(r.optMin, `${r.name}: optMin >= refMin`).toBeGreaterThanOrEqual(r.refMin);
    }
  });

  it("翻訳カードは実在する検査項目だけを参照する", () => {
    const ids = new Set(LAB_ROWS.map((r) => r.id));
    for (const t of LAB_TRANSLATIONS) {
      expect(t.rowIds.length).toBeGreaterThan(0);
      for (const id of t.rowIds) {
        expect(ids, `${t.id} が未知の項目 ${id} を参照`).toContain(id);
      }
    }
  });

  it("再検査で1項目以上が適正圏に入る — 継続提案が成立する条件", () => {
    const improved = LAB_ROWS.filter(
      (r) => judgeLab(r, r.first) !== "optimal" && judgeLab(r, r.retest) === "optimal",
    );
    expect(improved.length).toBeGreaterThan(0);
  });

  it("ローテーションは4日ぶんあり、反応クラス3以上の食品を含まない", () => {
    expect(ROTATION_PLAN).toHaveLength(4);
    const avoid = FOOD_REACTIONS.filter((f) => f.klass >= 3).map((f) => f.name);
    const planned = ROTATION_PLAN.flatMap((d) => d.items);
    for (const a of avoid) {
      expect(planned, `${a} は除外されるべき`).not.toContain(a);
    }
  });

  it("12週間の道のりに、検査・翻訳・接客・伴走・再検査がすべて入っている", () => {
    const titles = JOURNEY.map((s) => s.title).join(" ");
    for (const k of ["採血", "取り込む", "翻訳", "カウンセリング", "再検査"]) {
      expect(titles, `${k} の工程がない`).toContain(k);
    }
  });
});

describe("薬機法・医療広告の禁止語（§8.2）", () => {
  const texts = [
    ...LAB_ROWS.map((r) => r.note),
    ...LAB_TRANSLATIONS.flatMap((t) => [t.finding, t.meaning, t.action, t.skinLink]),
    ...JOURNEY.map((s) => s.body),
    RETEST_TALK.headline,
    ...RETEST_TALK.points,
    RETEST_TALK.note,
    LABTEST_DISCLAIMER,
  ];

  it("表示するすべての文言が禁止語を含まない", () => {
    for (const t of texts) {
      const check = containsBannedWord(t);
      expect(check.ok, `禁止語 ${check.hits.join("、")} — 「${t}」`).toBe(true);
    }
  });

  it("免責が「医療上の助言ではない」ことを明示している", () => {
    expect(LABTEST_DISCLAIMER).toContain("医療上の助言ではありません");
    expect(LABTEST_DISCLAIMER).toContain("架空");
  });
});
