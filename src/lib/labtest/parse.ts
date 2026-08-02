/**
 * 検査票の取り込み — 施術者が落としたファイルを、検査値の表に変える。
 *
 * 設計の前提:
 * - 患者は入力しない。データは必ず施術者側から入る。
 * - 検査会社ごとに書式が違う。CSV / TSV / 検査票からのコピペを同じ入口で受ける。
 * - **読めなかった行は捨てない**。捨てると「入れたはずの値が無い」事故になる。
 *   認識できた行と、できなかった行を、両方返して人に見せる。
 * - ここは純関数。ファイル読み込みも保存もしない（テストできる形に保つ）。
 */

import { LAB_ROWS, type LabRow } from "@/lib/field-cx/labtest-fixtures";

/** 検査票での表記ゆれ。左が検査票側、右が LAB_ROWS の id。 */
const ALIASES: Record<string, string> = {
  // 鉄・ミネラル
  フェリチン: "ferritin",
  ferritin: "ferritin",
  "血清フェリチン": "ferritin",
  亜鉛: "zinc",
  zn: "zinc",
  zinc: "zinc",
  マグネシウム: "mg",
  mg: "mg",
  magnesium: "mg",
  // ビタミン
  "ビタミンd": "vitd",
  "ビタミンd(25-oh)": "vitd",
  "25-ohビタミンd": "vitd",
  "25(oh)d": "vitd",
  vitd: "vitd",
  // たんぱく・肝
  アルブミン: "alb",
  alb: "alb",
  albumin: "alb",
  bun: "bun",
  尿素窒素: "bun",
  "bun(尿素窒素)": "bun",
  ast: "ast",
  "ast(got)": "ast",
  got: "ast",
  alt: "alt",
  "alt(gpt)": "alt",
  gpt: "alt",
  // 代謝
  ホモシステイン: "homocysteine",
  homocysteine: "homocysteine",
  hba1c: "hba1c",
  "hba1c(ngsp)": "hba1c",
  ヘモグロビンa1c: "hba1c",
};

/**
 * 同じ量を指す別単位。検査会社によって表記が違うだけなので、係数で寄せる。
 * key は「検査票の単位 → 基準にしている単位」。
 */
const UNIT_CONVERSIONS: Record<string, { to: string; factor: number }> = {
  // フェリチン: 1 ng/ml = 1 μg/L
  "μg/l": { to: "ng/ml", factor: 1 },
  "ug/l": { to: "ng/ml", factor: 1 },
  // ビタミンD: 1 ng/ml = 2.496 nmol/L
  "nmol/l": { to: "ng/ml", factor: 1 / 2.496 },
  // 亜鉛: 100 μg/L = 10 μg/dl（dl は L の 1/10）
  "μg/dl": { to: "μg/dl", factor: 1 },
  // 酵素
  "iu/l": { to: "U/l", factor: 1 },
  "u/l": { to: "U/l", factor: 1 },
};

export type ParsedLabValue = {
  /** LAB_ROWS の id。 */
  rowId: string;
  /** 検査票にあった項目名（そのまま残す。人が突き合わせるため）。 */
  sourceLabel: string;
  /** 基準の単位に寄せたあとの値。 */
  value: number;
  /** 検査票にあった単位。 */
  sourceUnit: string;
  /** 単位換算をしたか。したなら人に見せる。 */
  converted: boolean;
};

export type UnparsedLine = {
  /** 何行目か（1始まり）。人が検査票を目で追えるように。 */
  line: number;
  text: string;
  reason: "項目名が辞書にない" | "数値が読めない" | "列が足りない";
};

export type LabParseResult = {
  values: ParsedLabValue[];
  unparsed: UnparsedLine[];
  /** 認識できた項目 / 検査票の意味のある行 の割合（0〜1）。 */
  coverage: number;
};

/**
 * 突き合わせ用に、項目名を潰す。
 *
 * NFKC が要る。検査票には「ビタミンＤ」のように全角英字が混ざり、
 * toLowerCase() では半角に寄らない（全角Ｄと半角dは別文字のまま）。
 * 全角かっこ・全角数字も NFKC で同時に片づく。
 */
function normalizeLabel(raw: string): string {
  return raw
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[　\s]/g, "")
    .replace(/[：:]$/, "");
}

/** 単位の表記ゆれを潰す。μ（マイクロ）は記号とギリシャ文字の2種類がある。 */
function normalizeUnit(raw: string): string {
  return raw
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[　\s]/g, "")
    .replace(/µ/g, "μ");
}

/**
 * 「1,234.5」「12.3 *」「<0.5」のような検査票の書き方から数値を取り出す。
 * 「<0.5」は境界値なので 0.5 として扱い、丸めたことは呼び出し側には伝えない
 * （表示は元の文字列を sourceLabel 側に残す設計）。
 */
function parseNumber(raw: string): number | null {
  const cleaned = raw
    .trim()
    .replace(/,/g, "")
    .replace(/^[<>≦≧]/, "")
    .replace(/[*＊†H L↑↓]+$/g, "")
    .trim();
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** 行を列に割る。タブ / カンマ / 2つ以上の空白 のどれでも受ける。 */
function splitColumns(line: string): string[] {
  if (line.includes("\t")) return line.split("\t");
  if (line.includes(",")) return line.split(",");
  return line.split(/ {2,}|　+/);
}

const ROW_BY_ID = new Map<string, LabRow>(LAB_ROWS.map((r) => [r.id, r]));

/**
 * 検査票のテキストを検査値に変える。
 *
 * 想定する形: 1行 = 1項目で、少なくとも「項目名」と「値」の2列があること。
 * 3列目に単位があれば単位換算に使う。ヘッダ行や区切り線は自動で飛ばす。
 */
export function parseLabReport(text: string): LabParseResult {
  const values: ParsedLabValue[] = [];
  const unparsed: UnparsedLine[] = [];
  const seen = new Set<string>();

  const lines = text.split(/\r?\n/);
  let meaningfulLines = 0;

  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (line === "") return;
    // 区切り線・ヘッダらしき行は、読めなかった行として数えない。
    if (/^[-=─━\s|+]+$/.test(line)) return;
    // 「項目\t結果\t単位」のようなヘッダ行。日本語の直後に \b は立たないので、
    // 区切り文字か行末が続くことを直接見る。
    if (/^(項目|検査項目|item|test)([\t,\s]|$)/i.test(line)) return;

    meaningfulLines += 1;

    const cols = splitColumns(line).map((c) => c.trim()).filter((c) => c !== "");
    if (cols.length < 2) {
      unparsed.push({ line: i + 1, text: line, reason: "列が足りない" });
      return;
    }

    const label = cols[0];
    const rowId = ALIASES[normalizeLabel(label)];
    if (!rowId || !ROW_BY_ID.has(rowId)) {
      unparsed.push({ line: i + 1, text: line, reason: "項目名が辞書にない" });
      return;
    }

    const rawValue = parseNumber(cols[1]);
    if (rawValue === null) {
      unparsed.push({ line: i + 1, text: line, reason: "数値が読めない" });
      return;
    }

    // 同じ項目が2回出てきたら、後の行を採らない（検査票の再掲載が多いため）。
    if (seen.has(rowId)) return;
    seen.add(rowId);

    const row = ROW_BY_ID.get(rowId)!;
    const sourceUnit = cols[2] ?? "";
    const conv = UNIT_CONVERSIONS[normalizeUnit(sourceUnit)];
    const applicable = Boolean(conv && normalizeUnit(conv.to) === normalizeUnit(row.unit));
    // 係数が 1 の対応（μg/L と ng/ml など）は、呼び名が違うだけで値は同じ。
    // それを「換算しました」と出すと、確認すべき項目が埋もれる。
    const converted = applicable && conv!.factor !== 1;
    const value = applicable ? roundTo(rawValue * conv!.factor, 2) : rawValue;

    values.push({
      rowId,
      sourceLabel: label,
      value,
      sourceUnit: sourceUnit || row.unit,
      converted,
    });
  });

  return {
    values,
    unparsed,
    coverage: meaningfulLines === 0 ? 0 : values.length / meaningfulLines,
  };
}

function roundTo(n: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

/**
 * 取り込む前に人へ出す注意書き。
 * 「読めなかった行がある」ことを黙って飲み込まないための文言を組み立てる。
 */
export function ingestWarnings(result: LabParseResult): string[] {
  const out: string[] = [];
  if (result.values.length === 0) {
    out.push("検査値をひとつも読み取れませんでした。列の区切り（タブ・カンマ）をご確認ください。");
  }
  const unknown = result.unparsed.filter((u) => u.reason === "項目名が辞書にない");
  if (unknown.length > 0) {
    out.push(`${unknown.length} 行は項目名が辞書に無いため取り込みません（検査票の値は変わりません）。`);
  }
  const badNumber = result.unparsed.filter((u) => u.reason === "数値が読めない");
  if (badNumber.length > 0) {
    out.push(`${badNumber.length} 行は数値として読めませんでした。手入力での確認が必要です。`);
  }
  const converted = result.values.filter((v) => v.converted);
  if (converted.length > 0) {
    out.push(`${converted.length} 項目は単位を換算しました。表示前にご確認ください。`);
  }
  return out;
}
