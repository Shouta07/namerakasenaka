import { describe, expect, it } from "vitest";
import { ingestWarnings, parseLabReport } from "../parse";

/**
 * 検査票の取り込み。
 *
 * ここで守りたいのは正確さより先に「黙って落とさない」こと。
 * 読めなかった行が unparsed に必ず現れることを、いちばん厚く固定する。
 */

describe("parseLabReport — 区切り文字", () => {
  it("タブ区切りを読む", () => {
    const r = parseLabReport("フェリチン\t42\tng/ml");
    expect(r.values).toHaveLength(1);
    expect(r.values[0]).toMatchObject({ rowId: "ferritin", value: 42 });
  });

  it("カンマ区切りを読む", () => {
    const r = parseLabReport("亜鉛,62,μg/dl");
    expect(r.values[0]).toMatchObject({ rowId: "zinc", value: 62 });
  });

  it("空白2つ以上の区切りを読む", () => {
    const r = parseLabReport("アルブミン   4.2   g/dl");
    expect(r.values[0]).toMatchObject({ rowId: "alb", value: 4.2 });
  });

  it("単位の列が無くても値は取れる", () => {
    const r = parseLabReport("HbA1c\t5.8");
    expect(r.values[0]).toMatchObject({ rowId: "hba1c", value: 5.8 });
  });
});

describe("parseLabReport — 表記ゆれ", () => {
  it("全角かっこ・空白・大文字小文字を吸収する", () => {
    const r = parseLabReport("ビタミンＤ（25-OH）\t18\tng/ml");
    expect(r.values[0]?.rowId).toBe("vitd");
  });

  it("英語名でも引ける", () => {
    const r = parseLabReport("Ferritin,42,ng/ml");
    expect(r.values[0]?.rowId).toBe("ferritin");
  });

  it("AST(GOT) のような併記を引ける", () => {
    const r = parseLabReport("AST(GOT)\t22\tU/l");
    expect(r.values[0]?.rowId).toBe("ast");
  });
});

describe("parseLabReport — 数値の書き方", () => {
  it("桁区切りのカンマが入ったタブ区切りの数値を読む", () => {
    const r = parseLabReport("フェリチン\t1,024\tng/ml");
    expect(r.values[0]?.value).toBe(1024);
  });

  it("H / L の判定記号を落として読む", () => {
    const r = parseLabReport("亜鉛\t62 L\tμg/dl");
    expect(r.values[0]?.value).toBe(62);
  });

  it("「<0.5」は境界値 0.5 として扱う", () => {
    const r = parseLabReport("ホモシステイン\t<0.5\tnmol/ml");
    expect(r.values[0]?.value).toBe(0.5);
  });
});

describe("parseLabReport — 単位換算", () => {
  it("μg/L のフェリチンは ng/ml と同値として扱う", () => {
    const r = parseLabReport("フェリチン\t42\tμg/L");
    expect(r.values[0]).toMatchObject({ value: 42, converted: false });
  });

  it("nmol/L のビタミンD を ng/ml に換算し、換算したことを残す", () => {
    const r = parseLabReport("ビタミンD\t50\tnmol/L");
    expect(r.values[0]?.converted).toBe(true);
    // 50 / 2.496 ≒ 20.03
    expect(r.values[0]?.value).toBeCloseTo(20.03, 1);
  });
});

describe("parseLabReport — 読めなかった行を落とさない", () => {
  it("辞書に無い項目名は unparsed に残る", () => {
    const r = parseLabReport("謎の検査項目\t12\tmg/dl");
    expect(r.values).toHaveLength(0);
    expect(r.unparsed).toHaveLength(1);
    expect(r.unparsed[0]).toMatchObject({
      line: 1,
      reason: "項目名が辞書にない",
    });
  });

  it("数値として読めない行は理由つきで残る", () => {
    const r = parseLabReport("フェリチン\t測定不能\tng/ml");
    expect(r.unparsed[0]?.reason).toBe("数値が読めない");
  });

  it("列が足りない行も残る", () => {
    const r = parseLabReport("フェリチン");
    expect(r.unparsed[0]?.reason).toBe("列が足りない");
  });

  it("行番号は元のテキストの行に一致する（人が検査票を追えること）", () => {
    const r = parseLabReport(
      ["フェリチン\t42\tng/ml", "謎の項目\t9\tmg/dl", "亜鉛\t62\tμg/dl"].join("\n"),
    );
    expect(r.values).toHaveLength(2);
    expect(r.unparsed[0]?.line).toBe(2);
  });
});

describe("parseLabReport — 検査票のノイズ", () => {
  it("ヘッダ行と区切り線は読めなかった行に数えない", () => {
    const r = parseLabReport(
      ["項目\t結果\t単位", "--------", "フェリチン\t42\tng/ml"].join("\n"),
    );
    expect(r.values).toHaveLength(1);
    expect(r.unparsed).toHaveLength(0);
    expect(r.coverage).toBe(1);
  });

  it("同じ項目が再掲載されたら先に出たほうを採る", () => {
    const r = parseLabReport(
      ["フェリチン\t42\tng/ml", "フェリチン\t99\tng/ml"].join("\n"),
    );
    expect(r.values).toHaveLength(1);
    expect(r.values[0]?.value).toBe(42);
  });

  it("空文字は何も返さない（0除算しない）", () => {
    const r = parseLabReport("");
    expect(r.values).toEqual([]);
    expect(r.coverage).toBe(0);
  });
});

describe("ingestWarnings — 人に見せる注意書き", () => {
  it("1項目も読めなければ、区切り文字の確認を促す", () => {
    const w = ingestWarnings(parseLabReport("なにか\tへんな\tデータ"));
    expect(w.join()).toContain("読み取れませんでした");
  });

  it("辞書に無い行があることを黙って飲み込まない", () => {
    const w = ingestWarnings(
      parseLabReport(["フェリチン\t42\tng/ml", "謎\t9\tmg/dl"].join("\n")),
    );
    expect(w.some((x) => x.includes("辞書に無い"))).toBe(true);
  });

  it("単位換算をしたことを必ず伝える", () => {
    const w = ingestWarnings(parseLabReport("ビタミンD\t50\tnmol/L"));
    expect(w.some((x) => x.includes("単位を換算"))).toBe(true);
  });

  it("すべて素直に読めたときは注意書きを出さない", () => {
    const w = ingestWarnings(parseLabReport("フェリチン\t42\tng/ml"));
    expect(w).toEqual([]);
  });
});
