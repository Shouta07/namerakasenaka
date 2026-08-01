/**
 * 血液検査 → 継続伴走のデモデータ。
 *
 * 分子栄養医学（オーソモレキュラー）系の検査レポートの構造をそのまま写している:
 * - 検査会社の「基準範囲」と、予防医学の「適正範囲」を別々に持つ
 * - 基準範囲に入っていても適正範囲から外れている項目を拾えることが要点
 * - 食物IgG抗体パネルは 0〜IV のクラスと、4日ローテーションの運用がセット
 *
 * 値はすべてデモ用の架空データ。実在の方の検査結果は含めない。
 * 文言は §8.2 禁止語フィルタを通す前提で、断定を避けた表現に統一する。
 */

export type LabJudgement = "optimal" | "watch" | "out";

export type LabRow = {
  id: string;
  category: string;
  name: string;
  unit: string;
  /** 検査会社の基準範囲。 */
  refMin: number;
  refMax: number;
  /** 予防医学からみた適正範囲（基準範囲より狭い）。 */
  optMin: number;
  optMax: number;
  /** 初回採血。 */
  first: number;
  /** 3ヶ月後の再検査。 */
  retest: number;
  /** 何を見ている項目か、ひと言で。 */
  note: string;
  /** 適正へ向かう向き。raise=上げたい / lower=下げたい。ゲージの計算に使う。 */
  direction: "raise" | "lower";
};

/**
 * 判定は「基準範囲」と「適正範囲」の二段で行う。
 * - out   … 基準範囲の外
 * - watch … 基準範囲には入っているが、適正範囲から外れている
 * - optimal … 適正範囲の中
 */
export function judgeLab(row: Pick<LabRow, "refMin" | "refMax" | "optMin" | "optMax">, value: number): LabJudgement {
  if (value < row.refMin || value > row.refMax) return "out";
  if (value < row.optMin || value > row.optMax) return "watch";
  return "optimal";
}

/** 適正範囲からの距離。範囲の中なら 0。 */
function distanceToOptimal(
  row: Pick<LabRow, "optMin" | "optMax">,
  value: number,
): number {
  if (value < row.optMin) return row.optMin - value;
  if (value > row.optMax) return value - row.optMax;
  return 0;
}

export type LabChange =
  | "entered"
  | "held"
  | "closer"
  | "farther"
  | "same";

/**
 * 初回 → 再検査の変化の言い方。
 * 「適正に入った」と「もともと適正のまま」を混同しないこと —
 * 継続提案でそこを言い違えると、お客様の信頼を落とす。
 */
export function labChange(row: LabRow): { kind: LabChange; label: string } {
  const before = judgeLab(row, row.first);
  const after = judgeLab(row, row.retest);
  if (row.first === row.retest) return { kind: "same", label: "変化なし" };
  if (after === "optimal") {
    return before === "optimal"
      ? { kind: "held", label: "適正を維持" }
      : { kind: "entered", label: "適正圏に入りました" };
  }
  const d0 = distanceToOptimal(row, row.first);
  const d1 = distanceToOptimal(row, row.retest);
  if (d1 < d0) return { kind: "closer", label: "近づいています" };
  return { kind: "farther", label: "離れています" };
}

export const LAB_JUDGEMENT_META: Record<
  LabJudgement,
  { label: string; chip: string; bar: string }
> = {
  optimal: {
    label: "適正",
    chip: "bg-emerald-50 text-emerald-700",
    bar: "bg-emerald-500",
  },
  watch: {
    label: "基準内・適正外",
    chip: "bg-amber-50 text-amber-700",
    bar: "bg-amber-500",
  },
  out: { label: "基準外", chip: "bg-rose-50 text-rose-700", bar: "bg-rose-500" },
};

export const LAB_ROWS: LabRow[] = [
  {
    id: "ferritin",
    category: "鉄・ミネラル",
    name: "フェリチン",
    unit: "ng/ml",
    refMin: 21,
    refMax: 277,
    optMin: 80,
    optMax: 200,
    first: 42,
    retest: 88,
    note: "からだに蓄えている鉄の量。基準内でも少なめのことが多い項目です。",
    direction: "raise",
  },
  {
    id: "vitd",
    category: "ビタミン",
    name: "ビタミンD（25-OH）",
    unit: "ng/ml",
    refMin: 30,
    refMax: 100,
    optMin: 40,
    optMax: 60,
    first: 18,
    retest: 34,
    note: "日光と食事から作られ、皮ふのバリアや免疫と関わるとされています。",
    direction: "raise",
  },
  {
    id: "zinc",
    category: "鉄・ミネラル",
    name: "亜鉛",
    unit: "μg/dl",
    refMin: 80,
    refMax: 135,
    optMin: 90,
    optMax: 135,
    first: 68,
    retest: 86,
    note: "皮ふの入れ替わりに使われるミネラル。不足すると足りない側に傾きます。",
    direction: "raise",
  },
  {
    id: "mg",
    category: "鉄・ミネラル",
    name: "マグネシウム",
    unit: "mg/dl",
    refMin: 2.0,
    refMax: 2.6,
    optMin: 2.4,
    optMax: 2.8,
    first: 2.1,
    retest: 2.4,
    note: "エネルギーを作る反応に関わるミネラル。ストレスや下痢で減りやすいとされます。",
    direction: "raise",
  },
  {
    id: "alb",
    category: "タンパク・消化",
    name: "アルブミン",
    unit: "g/dl",
    refMin: 3.7,
    refMax: 5.5,
    optMin: 4.4,
    optMax: 5.5,
    first: 4.1,
    retest: 4.5,
    note: "タンパク質が足りているか・使えているかの目安。",
    direction: "raise",
  },
  {
    id: "bun",
    category: "タンパク・消化",
    name: "BUN（尿素窒素）",
    unit: "mg/dl",
    refMin: 8.0,
    refMax: 20.9,
    optMin: 15.0,
    optMax: 20.9,
    first: 9.8,
    retest: 13.4,
    note: "低めのときは、タンパク質の吸収が追いついていない可能性をみます。",
    direction: "raise",
  },
  {
    id: "ast",
    category: "肝・ビタミンB",
    name: "AST",
    unit: "U/l",
    refMin: 10,
    refMax: 40,
    optMin: 20,
    optMax: 30,
    first: 24,
    retest: 22,
    note: "ALT との差が大きいとき、ビタミンB6 の不足が示唆されるとされています。",
    direction: "lower",
  },
  {
    id: "alt",
    category: "肝・ビタミンB",
    name: "ALT",
    unit: "U/l",
    refMin: 5,
    refMax: 45,
    optMin: 20,
    optMax: 30,
    first: 13,
    retest: 19,
    note: "AST より低いときは、B群の消費が増えている可能性をみます。",
    direction: "raise",
  },
  {
    id: "homocysteine",
    category: "肝・ビタミンB",
    name: "ホモシステイン",
    unit: "nmol/ml",
    refMin: 3.7,
    refMax: 13.5,
    optMin: 3.7,
    optMax: 8.0,
    first: 11.8,
    retest: 8.6,
    note: "ビタミンB6・B12・葉酸が足りているかの目安になるとされています。",
    direction: "lower",
  },
  {
    id: "hba1c",
    category: "糖代謝",
    name: "HbA1c",
    unit: "%",
    refMin: 4.6,
    refMax: 6.4,
    optMin: 4.6,
    optMax: 5.5,
    first: 5.7,
    retest: 5.4,
    note: "過去1〜2ヶ月の血糖の平均。基準内でも上のほうだと甘いものの習慣がみえます。",
    direction: "lower",
  },
];

// ---------------------------------------------------------------
// ゲーミフィケーション — 数字を「材料集め」に読みかえる
//
// 検査値は、そのままだと「良い/悪い」の判定表に見えてしまう。
// ここでは「肌をつくる材料が、どこまでそろったか」というゲージに
// 読みかえる。責められている感じを消し、次の一歩を選べるようにする。
// ---------------------------------------------------------------

/**
 * 適正ラインまでの到達度（0〜100）。
 * - raise: 上げたい項目は 適正下限に対する到達率
 * - lower: 下げたい項目は 適正上限に対する超過ぶんを引いた率
 * 適正範囲の中に入っていれば 100。
 */
export function gaugePercent(row: LabRow, value: number): number {
  if (value >= row.optMin && value <= row.optMax) return 100;
  const pct =
    row.direction === "raise"
      ? (value / row.optMin) * 100
      : (row.optMax / value) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

/** 肌をつくる材料。検査項目をお客様の言葉のカテゴリにまとめる。 */
export type Material = {
  id: string;
  label: string;
  emoji: string;
  /** この材料を代表する検査項目。 */
  rowId: string;
  /** そろうと何ができるか。 */
  role: string;
};

export const MATERIALS: Material[] = [
  { id: "iron", label: "鉄", emoji: "🩸", rowId: "ferritin", role: "酸素と材料を運ぶ" },
  { id: "vitd", label: "ビタミンD", emoji: "☀️", rowId: "vitd", role: "肌の守りをつくる" },
  { id: "zinc", label: "亜鉛", emoji: "🧱", rowId: "zinc", role: "新しい皮ふをつくる" },
  { id: "protein", label: "タンパク質", emoji: "🍖", rowId: "alb", role: "肌そのものの材料" },
  { id: "mg", label: "マグネシウム", emoji: "⚡", rowId: "mg", role: "つくる力を動かす" },
];

export function materialRow(m: Material): LabRow {
  const row = LAB_ROWS.find((r) => r.id === m.rowId);
  if (!row) throw new Error(`unknown rowId: ${m.rowId}`);
  return row;
}

/**
 * 材料がそろった度。
 *
 * レベルは平均%ではなく「適正に届いた材料の数」で決める。
 * 平均だと、どれも中途半端なのに高いレベルが出てしまい、
 * 「そろった」と言えないものを言えることにしてしまうため。
 */
export function materialsLevel(values: "first" | "retest"): {
  level: number;
  gathered: number;
  total: number;
  /** 各材料の到達率の平均（参考値）。 */
  percent: number;
  title: string;
} {
  const pcts = MATERIALS.map((m) => {
    const row = materialRow(m);
    return gaugePercent(row, row[values]);
  });
  const gathered = pcts.filter((p) => p >= 100).length;
  const percent = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
  const level = Math.min(5, gathered + 1);
  return { level, gathered, total: MATERIALS.length, percent, title: LEVEL_TITLE[level] };
}

export const LEVEL_TITLE: Record<number, string> = {
  1: "材料をあつめはじめた",
  2: "土台づくりの時期",
  3: "材料がそろってきた",
  4: "入れ替わりの時期",
  5: "整えを保つ時期",
};

/** 続けたことに対して渡すバッジ。数字の良し悪しでは配らない。 */
export type Badge = {
  id: string;
  emoji: string;
  label: string;
  how: string;
  earned: boolean;
};

export const BADGES: Badge[] = [
  {
    id: "b-start",
    emoji: "🩸",
    label: "はじめの一歩",
    how: "検査を受けて、自分の数字を知った",
    earned: true,
  },
  {
    id: "b-guide",
    emoji: "📖",
    label: "翻訳を読んだ",
    how: "検査結果の解説をひととおり読んだ",
    earned: true,
  },
  {
    id: "b-7days",
    emoji: "🔥",
    label: "7日つづいた",
    how: "「今日のひとつ」を7日つづけた",
    earned: true,
  },
  {
    id: "b-rotation",
    emoji: "🔄",
    label: "4日ローテーション完走",
    how: "献立の4日サイクルを1周した",
    earned: true,
  },
  {
    id: "b-photo",
    emoji: "📷",
    label: "経過4回",
    how: "経過写真を4回のこした",
    earned: true,
  },
  {
    id: "b-half",
    emoji: "🎉",
    label: "折り返し",
    how: "コースの半分まで来た",
    earned: true,
  },
  {
    id: "b-retest",
    emoji: "🔁",
    label: "再検査までたどりついた",
    how: "3ヶ月後の再検査を受けた",
    earned: true,
  },
  {
    id: "b-level4",
    emoji: "🏅",
    label: "入れ替わりの時期へ",
    how: "材料がそろった度が Lv.4 になった",
    earned: false,
  },
  {
    id: "b-sixmonth",
    emoji: "🌳",
    label: "6ヶ月つづいた",
    how: "コースを最後まで続けた",
    earned: false,
  },
];

/** クエストマップ。12週間を5つのステージにまとめて現在地を示す。 */
export type Stage = {
  id: string;
  label: string;
  weeks: string;
  emoji: string;
  body: string;
};

export const STAGES: Stage[] = [
  {
    id: "s1",
    label: "自分の数字を知る",
    weeks: "Week 0–1",
    emoji: "🩸",
    body: "検査を受けて、いま何が足りていないかを言葉で受け取る。",
  },
  {
    id: "s2",
    label: "材料をあつめる",
    weeks: "Week 2–5",
    emoji: "🧺",
    body: "食事と生活で、足りない材料を毎日すこしずつ足していく。",
  },
  {
    id: "s3",
    label: "折り返しを確かめる",
    weeks: "Week 6",
    emoji: "📷",
    body: "写真と実感メモを並べて、変化を自分の目で確かめる。",
  },
  {
    id: "s4",
    label: "入れ替わりを待つ",
    weeks: "Week 7–11",
    emoji: "🌱",
    body: "材料がそろった状態を保つ。ここがいちばん止めたくなる時期。",
  },
  {
    id: "s5",
    label: "答え合わせをする",
    weeks: "Week 12",
    emoji: "🔁",
    body: "同じ検査をもう一度受けて、続けたことの結果を数字で見る。",
  },
];

/** いまいるステージ（デモは再検査到達＝5段目）。 */
export const CURRENT_STAGE_INDEX = 4;

/** 週ごとの継続ログ。伴走が続いているかを一目で見せるヒートマップ用。 */
export const STREAK_WEEKS: { week: number; done: number }[] = [
  { week: 1, done: 7 },
  { week: 2, done: 6 },
  { week: 3, done: 7 },
  { week: 4, done: 4 },
  { week: 5, done: 5 },
  { week: 6, done: 7 },
  { week: 7, done: 3 },
  { week: 8, done: 6 },
  { week: 9, done: 7 },
  { week: 10, done: 5 },
  { week: 11, done: 6 },
  { week: 12, done: 7 },
];

export const STREAK_NOTE =
  "できなかった週があっても、色が薄くなるだけで、消えることはありません。7割つづけばじゅうぶんです。";

/** 検査結果を「お客様のことば」に翻訳した1行。ai-guide の中核データ。 */
export type LabTranslation = {
  id: string;
  /** 検査でわかったこと（事実）。 */
  finding: string;
  /** からだで起きていること（断定しない）。 */
  meaning: string;
  /** 今日からできること（小さく具体的に）。 */
  action: string;
  /** 背中の肌の悩みとのつながり。 */
  skinLink: string;
  rowIds: string[];
};

export const LAB_TRANSLATIONS: LabTranslation[] = [
  {
    id: "t-iron",
    finding: "鉄の蓄え（フェリチン）が 42 と、適正の目安 80 より少なめでした。",
    meaning:
      "鉄は酸素を運ぶ役です。少なめだと、新しい皮ふをつくる現場に材料と酸素が届きにくくなっている可能性があります。",
    action:
      "赤身の魚・肉を週2回、ビタミンCの多い野菜や果物と一緒に。コーヒー・緑茶は食事の前後30分をあけてみましょう。",
    skinLink: "肌の入れ替わりがゆっくりになり、跡が残っている感じが続きやすくなります。",
    rowIds: ["ferritin"],
  },
  {
    id: "t-vitd",
    finding: "ビタミンD が 18 と、基準範囲（30以上）を下回っていました。",
    meaning:
      "ビタミンDは日光と食事からつくられ、皮ふのバリアや免疫のはたらきと関わるとされています。冬や在宅時間が長い時期に下がりやすい項目です。",
    action: "日中15分、外を歩く時間を1日1回。鮭・さば・きのこを週に数回とり入れてみましょう。",
    skinLink: "外からの刺激に敏感になり、背中がゆらぎやすい状態と関わることがあります。",
    rowIds: ["vitd"],
  },
  {
    id: "t-zinc",
    finding: "亜鉛が 68 と、基準範囲（80以上）を下回っていました。",
    meaning:
      "亜鉛は皮ふが新しく入れ替わるときに使われるミネラルです。足りないと入れ替わりのペースが落ちる可能性があります。",
    action:
      "牡蠣・牛の赤身・卵・ナッツを意識して。加工食品と甘い飲みものを、まず週の半分に減らしてみましょう。",
    skinLink: "毛穴のつまりが残りやすく、同じ場所がくり返しやすい状態と関わることがあります。",
    rowIds: ["zinc"],
  },
  {
    id: "t-protein",
    finding:
      "BUN 9.8・アルブミン 4.1 と、タンパク質まわりの項目がそろって低めでした（AST 24 と ALT 13 の差も開いています）。",
    meaning:
      "食べた量よりも、消化して吸収できている量が追いついていない可能性があります。胃酸や腸の状態が関わることもあるとされています。",
    action:
      "1食に手のひら1枚分のタンパク質を。ひと口30回を目安によく噛み、食後すぐの水分の摂りすぎを控えてみましょう。",
    skinLink: "肌をつくる材料そのものが不足しやすく、変化が出るまでに時間がかかります。",
    rowIds: ["bun", "alb", "ast", "alt"],
  },
];

/** 食物IgG抗体パネル。0〜IV のクラスで反応の高さをみる。 */
export type FoodReaction = {
  name: string;
  category: string;
  klass: 0 | 1 | 2 | 3 | 4;
};

export const FOOD_CLASS_LABEL: Record<number, string> = {
  0: "反応なし",
  1: "低い",
  2: "中程度",
  3: "高い",
  4: "とても高い",
};

export const FOOD_REACTIONS: FoodReaction[] = [
  { name: "鶏卵白", category: "卵・肉", klass: 4 },
  { name: "カゼイン（乳）", category: "乳製品", klass: 3 },
  { name: "グルテン", category: "穀物", klass: 3 },
  { name: "パン酵母", category: "その他", klass: 2 },
  { name: "タマネギ", category: "野菜", klass: 2 },
  { name: "カンジダ アルビカンス", category: "その他", klass: 2 },
  { name: "牛乳", category: "乳製品", klass: 1 },
  { name: "白米", category: "穀物", klass: 0 },
  { name: "鮭", category: "魚介", klass: 0 },
  { name: "ブロッコリー", category: "野菜", klass: 0 },
];

/** 4日ローテーション — 反応が高かった食品を外し、同じ食品が4日に1日以下になるよう組む。 */
export const ROTATION_PLAN: { day: string; items: string[] }[] = [
  { day: "Day 1", items: ["鮭", "ブロッコリー", "玄米", "アボカド"] },
  { day: "Day 2", items: ["鶏むね肉", "ほうれん草", "そば", "ブルーベリー"] },
  { day: "Day 3", items: ["さば", "かぼちゃ", "さつまいも", "キウイ"] },
  { day: "Day 4", items: ["豚肉", "キャベツ", "白米", "りんご"] },
];

/** 検査から再検査までの12週間。伴走が「商品」になっていることを見せる。 */
export type JourneyStep = {
  week: string;
  title: string;
  who: "clinic" | "salon" | "customer" | "accord";
  body: string;
};

export const WHO_META: Record<
  JourneyStep["who"],
  { label: string; chip: string }
> = {
  clinic: { label: "提携クリニック", chip: "bg-sky-50 text-sky-700" },
  salon: { label: "サロン", chip: "bg-brand-50 text-brand-700" },
  customer: { label: "お客様", chip: "bg-stone-100 text-stone-600" },
  accord: { label: "Accord", chip: "bg-violet-50 text-violet-700" },
};

export const JOURNEY: JourneyStep[] = [
  {
    week: "Week 0",
    title: "採血・検査",
    who: "clinic",
    body: "提携クリニックで採血。結果は1週間ほどで届きます。",
  },
  {
    week: "Week 1",
    title: "検査結果を取り込む",
    who: "accord",
    body: "項目・基準範囲・適正範囲・測定値を構造化。基準内でも適正から外れた項目に印がつきます。",
  },
  {
    week: "Week 1",
    title: "翻訳ガイドを作る",
    who: "accord",
    body: "「検査でわかったこと → からだで起きていること → 今日からできること」に翻訳。サロンが内容を確認してから出します。",
  },
  {
    week: "Week 1",
    title: "カウンセリングで見せる",
    who: "salon",
    body: "紙の検査票ではなく、翻訳ガイドを一緒に見ながら話す。ご自身の数字なので、話が自分ごとになります。",
  },
  {
    week: "Week 2",
    title: "6ヶ月コースを開始",
    who: "customer",
    body: "「なぜ6ヶ月なのか」が数字で腑に落ちた状態で始まります。",
  },
  {
    week: "Week 2–11",
    title: "今日のひとつ・LINE・食事",
    who: "accord",
    body: "来店の間も、その週のテーマを1つだけ届ける。食事の記録には管理栄養士の確認を通したコメントが返ります。",
  },
  {
    week: "Week 6",
    title: "折り返しの経過共有",
    who: "salon",
    body: "経過写真と実感メモを並べて、変化を一緒に確認。担当からのひとことを添えて送ります。",
  },
  {
    week: "Week 12",
    title: "再検査",
    who: "clinic",
    body: "同じ項目をもう一度。数字の変化が、続けてきたことの答え合わせになります。",
  },
  {
    week: "Week 13",
    title: "次の6ヶ月を決める",
    who: "salon",
    body: "変わった項目・まだ途中の項目を見ながら、次のテーマを一緒に決めます。",
  },
];

/** 再検査後、スタッフが使う継続提案のトーク。断定しない・責めない。 */
export const RETEST_TALK = {
  headline: "3ヶ月で、材料はそろってきました。ここからが入れ替わりの時期です。",
  points: [
    "鉄の蓄えが 42 → 88 に。酸素と材料が届きやすい状態に近づいてきました。",
    "ビタミンD 18 → 34。まだ適正の目安（40〜60）には届いていないので、日光と食事はこのまま続けましょう。",
    "亜鉛 68 → 86。皮ふの入れ替わりに使う材料がそろってきた時期です。",
    "皮ふが一周入れ替わるのに数ヶ月かかるといわれています。数字が整ってきた今こそ、続ける価値がある時期です。",
  ],
  note: "数字はお客様を評価するものではなく、次のテーマを決めるための材料です。届いていない項目があっても、責める言い方はしません。",
};

export const LABTEST_DISCLAIMER =
  "本デモは架空のデータです。検査値の解釈と診断は医師が行います。ここで表示する内容は一般的な栄養に関する参考情報であり、医療上の助言ではありません。感じ方や変化には個人差があります。";
