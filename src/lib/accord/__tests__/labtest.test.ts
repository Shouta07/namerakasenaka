import { describe, expect, it } from "vitest";
import { containsBannedWord } from "@/lib/compliance/banned-words";
import {
  BADGES,
  CAUSE_NODES,
  CAUSE_ROUTES,
  CAUSE_MAP_NOTE,
  RADAR_AXES,
  CURRENT_STAGE_INDEX,
  LAB_TRANSLATIONS_RETEST,
  FOOD_REACTIONS,
  JOURNEY,
  LABTEST_DISCLAIMER,
  LAB_ROWS,
  LAB_TRANSLATIONS,
  LEVEL_TITLE,
  MATERIALS,
  RETEST_TALK,
  ROTATION_PLAN,
  STAGES,
  STREAK_NOTE,
  STREAK_WEEKS,
  gaugePercent,
  judgeLab,
  labChange,
  materialRow,
  materialsLevel,
  badgeEarned,
  radarRow,
  routeFor,
  stageIndexFor,
  translationsFor,
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
    direction: "raise" as const,
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

describe("ゲーミフィケーション — 材料ゲージとレベル", () => {
  it("適正範囲の中なら 100%", () => {
    const r = LAB_ROWS.find((x) => x.id === "ferritin")!;
    expect(gaugePercent(r, 120)).toBe(100);
    expect(gaugePercent(r, r.optMin)).toBe(100);
  });

  it("上げたい項目は適正下限への到達率になる", () => {
    const r = LAB_ROWS.find((x) => x.id === "ferritin")!; // optMin 80
    expect(gaugePercent(r, 40)).toBe(50);
    expect(gaugePercent(r, 20)).toBe(25);
  });

  it("下げたい項目は超過ぶんだけ下がる", () => {
    const r = LAB_ROWS.find((x) => x.id === "hba1c")!; // optMax 5.5
    expect(gaugePercent(r, 5.5)).toBe(100);
    expect(gaugePercent(r, 11)).toBe(50);
  });

  it("0〜100 に収まり、負の値やゼロ割で壊れない", () => {
    for (const r of LAB_ROWS) {
      for (const v of [0.0001, r.first, r.retest, r.refMax * 10]) {
        const p = gaugePercent(r, v);
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(100);
      }
    }
  });

  it("材料はすべて実在する検査項目を指す", () => {
    for (const m of MATERIALS) {
      expect(() => materialRow(m)).not.toThrow();
    }
  });

  it("3ヶ月後はレベルが上がる — 続けた意味が見える形になっている", () => {
    const a = materialsLevel("first");
    const b = materialsLevel("retest");
    expect(b.percent).toBeGreaterThan(a.percent);
    expect(b.level).toBeGreaterThan(a.level);
    expect(b.level).toBeLessThanOrEqual(5);
    expect(a.level).toBeGreaterThanOrEqual(1);
  });

  it("レベルは平均%ではなく、適正に届いた材料の数で決まる", () => {
    const a = materialsLevel("first");
    const b = materialsLevel("retest");
    // 初回はどれも適正に届いていない → Lv.1 から始まる物語になっている
    expect(a.gathered).toBe(0);
    expect(a.level).toBe(1);
    expect(b.level).toBe(b.gathered + 1);
    expect(b.gathered).toBeLessThanOrEqual(b.total);
    // 平均は高くても、そろっていなければレベルは上がらない
    expect(a.percent).toBeGreaterThan(50);
  });

  it("バッジは続けたことに対して配る — 未獲得も残しておく", () => {
    expect(BADGES.filter((b) => badgeEarned(b, "retest")).length).toBeGreaterThan(0);
    expect(BADGES.some((b) => !badgeEarned(b, "retest"))).toBe(true);
  });

  it("タブを切り替えるとバッジが増える。初回で得たものは消えない", () => {
    const first = BADGES.filter((b) => badgeEarned(b, "first"));
    const retest = BADGES.filter((b) => badgeEarned(b, "retest"));
    expect(first.length).toBeGreaterThan(0);
    expect(retest.length).toBeGreaterThan(first.length);
    for (const b of first) {
      expect(badgeEarned(b, "retest"), `${b.label} が3ヶ月後に消えている`).toBe(true);
    }
  });

  it("現在地はタブで動く — 初回は出発地点、3ヶ月後は答え合わせ", () => {
    expect(stageIndexFor("first")).toBe(0);
    expect(stageIndexFor("retest")).toBe(STAGES.length - 1);
  });

  it("再検査ぶんの翻訳が、初回と同じ枠・同じ件数で用意されている", () => {
    const a = translationsFor("first");
    const b = translationsFor("retest");
    expect(b.map((t) => t.id)).toEqual(a.map((t) => t.id));
    for (const [i, t] of b.entries()) {
      expect(t.finding).not.toBe(a[i].finding);
      expect(t.rowIds).toEqual(a[i].rowIds);
    }
  });

  it("現在地はステージの範囲内", () => {
    expect(CURRENT_STAGE_INDEX).toBeGreaterThanOrEqual(0);
    expect(CURRENT_STAGE_INDEX).toBeLessThan(STAGES.length);
  });

  it("継続ログは12週ぶんで、1週7日を超えない", () => {
    expect(STREAK_WEEKS).toHaveLength(12);
    for (const w of STREAK_WEEKS) {
      expect(w.done).toBeGreaterThanOrEqual(0);
      expect(w.done).toBeLessThanOrEqual(7);
    }
  });
});

describe("レーダーと「なぜ」の地図", () => {
  it("6軸すべてが実在する検査項目を指す", () => {
    expect(RADAR_AXES).toHaveLength(6);
    for (const a of RADAR_AXES) {
      expect(() => radarRow(a)).not.toThrow();
    }
  });

  it("軸のラベルは検査項目名ではなく、お客様のことばに翻訳されている", () => {
    const rawNames = LAB_ROWS.map((r) => r.name);
    for (const a of RADAR_AXES) {
      expect(rawNames, `${a.label} が検査項目名のまま`).not.toContain(a.label);
      expect(a.label.length).toBeLessThanOrEqual(8);
    }
  });

  it("すべての軸に、肌までの1本道がある", () => {
    for (const a of RADAR_AXES) {
      const r = routeFor(a.id);
      expect(r.path).toHaveLength(4);
    }
  });

  it("道は くらし → からだ → 検査 → 肌 の順に4層をまたぐ", () => {
    const layerOf = new Map(CAUSE_NODES.map((n) => [n.id, n.layer]));
    for (const r of CAUSE_ROUTES) {
      expect(r.path.map((id) => layerOf.get(id))).toEqual([
        "life",
        "body",
        "sign",
        "skin",
      ]);
    }
  });

  it("道が参照するノードはすべて地図の上に存在する", () => {
    const ids = new Set(CAUSE_NODES.map((n) => n.id));
    for (const r of CAUSE_ROUTES) {
      for (const id of r.path) {
        expect(ids, `${r.axisId} が未知のノード ${id} を指す`).toContain(id);
      }
    }
  });

  it("レーダーの値は0〜100に収まる（描画がはみ出さない）", () => {
    for (const a of RADAR_AXES) {
      const r = radarRow(a);
      for (const v of [r.first, r.retest]) {
        const p = gaugePercent(r, v);
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe("薬機法・医療広告の禁止語（§8.2）", () => {
  const texts = [
    ...LAB_ROWS.map((r) => r.note),
    ...LAB_TRANSLATIONS.flatMap((t) => [t.finding, t.meaning, t.action, t.skinLink]),
    ...LAB_TRANSLATIONS_RETEST.flatMap((t) => [t.finding, t.meaning, t.action, t.skinLink]),
    ...JOURNEY.map((s) => s.body),
    ...MATERIALS.map((m) => m.role),
    ...Object.values(LEVEL_TITLE),
    ...BADGES.flatMap((b) => [b.label, b.how]),
    ...STAGES.flatMap((s) => [s.label, s.body]),
    ...RADAR_AXES.flatMap((a) => [a.label, a.what, a.ifLow]),
    ...CAUSE_NODES.map((n) => n.label),
    ...CAUSE_ROUTES.map((r) => r.story),
    CAUSE_MAP_NOTE,
    STREAK_NOTE,
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
