/**
 * LINE で届く記入フォーマット。
 *
 * やりとりはすべて LINE で完結させる。Web は入力を持たない。
 * ただし「自由に書いてください」では記録に落ちないので、毎回この形で送り、
 * 返信をそのまま項目に分解して Web の記録にする。
 *
 * 設計のきまり:
 * - 1通で聞くのは4項目まで。指1本で終わる量にする
 * - 選ぶだけで答えられる項目を先に、書く項目は最後・任意
 * - 書式が崩れた返信も受け取る（読めた項目だけ記録し、残りは空のままにする）
 */

export type LineFieldKind = "choice" | "scale" | "text" | "photo";

export type LineField = {
  key: string;
  label: string;
  kind: LineFieldKind;
  /** 選択肢（choice のとき）。 */
  options?: string[];
  /** 目盛りの範囲（scale のとき）。 */
  range?: [number, number];
  required: boolean;
  /** 記入例。 */
  example: string;
};

export type LineFormat = {
  id: string;
  title: string;
  /** いつ届くか。 */
  when: string;
  /** なぜ聞くのか — 目的が分かると答えてもらえる。 */
  why: string;
  fields: LineField[];
  /** Web のどこに記録されるか。 */
  recordedTo: string;
};

export const LINE_FORMATS: LineFormat[] = [
  {
    id: "weekly-checkin",
    title: "今週のふりかえり",
    when: "毎週日曜 20:00",
    why: "肌の変わり目を見つけるための材料になります。答えるのは30秒です。",
    fields: [
      {
        key: "skin",
        label: "肌の調子",
        kind: "scale",
        range: [1, 5],
        required: true,
        example: "4",
      },
      {
        key: "body",
        label: "体調",
        kind: "scale",
        range: [1, 5],
        required: true,
        example: "3",
      },
      {
        key: "action",
        label: "今週のケア",
        kind: "choice",
        options: ["できた", "だいたい", "おやすみ"],
        required: true,
        example: "だいたい",
      },
      {
        key: "memo",
        label: "ひとこと",
        kind: "text",
        required: false,
        example: "外食が続いた週でした",
      },
    ],
    recordedTo: "「今日」タブの記録",
  },
  {
    id: "photo",
    title: "背中の写真",
    when: "来店の前日",
    why: "同じ条件で並べるために、明るい場所で・鏡ごしに・肩が入る位置でお願いします。",
    fields: [
      {
        key: "photo",
        label: "写真",
        kind: "photo",
        required: true,
        example: "（画像を1枚送る）",
      },
      {
        key: "condition",
        label: "気になるところ",
        kind: "text",
        required: false,
        example: "右の肩甲骨のあたり",
      },
    ],
    recordedTo: "「背中ケア」タブの記録",
  },
];

/** LINE に流す本文。そのままコピーして使える形にしておく。 */
export function renderLineTemplate(format: LineFormat): string {
  const lines = format.fields.map((f) => {
    if (f.kind === "scale" && f.range) {
      return `${f.label}（${f.range[0]}〜${f.range[1]}）：`;
    }
    if (f.kind === "choice" && f.options) {
      return `${f.label}（${f.options.join(" / ")}）：`;
    }
    if (f.kind === "photo") return `${f.label}：（画像を送ってください）`;
    return `${f.label}${f.required ? "" : "（任意）"}：`;
  });
  return `【${format.title}】\n${lines.join("\n")}`;
}

/** 記入例。読み方が分かるように、答えが入った状態も見せる。 */
export function renderLineExample(format: LineFormat): string {
  const lines = format.fields.map((f) => `${f.label}：${f.example}`);
  return `【${format.title}】\n${lines.join("\n")}`;
}
