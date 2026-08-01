/**
 * Accord — クリニック・サロンの初回カウンセリング支援サービス。
 *
 * デモ用フィクスチャ。Accord は「機能モジュールを増減できる」ことが
 * コンセプトなので、MODULES を単一の情報源として、ナビ・トグル・
 * 各ページのガードすべてがここを参照する。
 */

export type AccordModuleId =
  | "counseling"
  | "labtest"
  | "copilot"
  | "roleplay"
  | "dashboard"
  | "line"
  | "followup"
  | "mentoring";

export type AccordModule = {
  id: AccordModuleId;
  name: string;
  short: string;
  description: string;
  emoji: string;
  /** コア機能はオフにできない。 */
  core?: boolean;
  href?: string;
};

export const ACCORD_MODULES: AccordModule[] = [
  {
    id: "counseling",
    name: "初回カウンセリング記録",
    short: "カウンセリング",
    description:
      "初回カウンセリングの内容を構造化して記録。次の接客と提案の土台になります。",
    emoji: "📋",
    core: true,
    href: "/accord/customers",
  },
  {
    id: "labtest",
    name: "血液検査の翻訳ガイド",
    short: "検査翻訳",
    description:
      "検査結果を「検査でわかったこと → からだで起きていること → 今日からできること」に翻訳。再検査で変化を見せるまでが一続きです。",
    emoji: "🩸",
    href: "/accord/labtest",
  },
  {
    id: "copilot",
    name: "接客と継続のコパイロット",
    short: "コパイロット",
    description:
      "成約・継続・練習の数字から、気づきと次の一手を毎朝提案。見るだけで終わらせず、その場で実行できます。",
    emoji: "🧠",
    href: "/accord/copilot",
  },
  {
    id: "roleplay",
    name: "AI相手の接客練習",
    short: "接客練習",
    description:
      "AIがお客様役になり、初回カウンセリングを何度でも練習。終了後にフィードバックが届きます。",
    emoji: "🎭",
    href: "/accord/roleplay",
  },
  {
    id: "dashboard",
    name: "成約の見える化",
    short: "ダッシュボード",
    description:
      "初回予約から成約までのファネルと、スタッフ別の成約率を一目で。感覚ではなく数字で振り返ります。",
    emoji: "📊",
    href: "/accord/dashboard",
  },
  {
    id: "line",
    name: "LINE経過共有",
    short: "LINE共有",
    description:
      "記録や写真の経過を、ご本人の同意のもと LINE でお客様の手元へ。紙は渡さず、何度でも見返せます。",
    emoji: "💬",
  },
  {
    id: "followup",
    name: "顧客別の継続フォロー",
    short: "継続フォロー",
    description:
      "成約後の関わり（来店・連絡・気づき）を顧客ごとのタイムラインに記録。担当が変わっても引き継げます。",
    emoji: "🌱",
    href: "/accord/customers",
  },
  {
    id: "mentoring",
    name: "月1回の伴走",
    short: "月1伴走",
    description:
      "月に一度、数字と練習ログを一緒に振り返り、翌月の接客テーマを決めます。",
    emoji: "🤝",
    href: "/accord/dashboard",
  },
];

export const DEFAULT_MODULE_STATE: Record<AccordModuleId, boolean> = {
  counseling: true,
  labtest: true,
  copilot: true,
  roleplay: true,
  dashboard: true,
  line: true,
  followup: true,
  mentoring: true,
};

// ---------------------------------------------------------------
// ダッシュボード（成約の見える化）
// ---------------------------------------------------------------

export const FUNNEL_THIS_MONTH = [
  { stage: "初回予約", count: 22 },
  { stage: "来店", count: 19 },
  { stage: "カウンセリング完了", count: 18 },
  { stage: "コース提案", count: 15 },
  { stage: "成約", count: 11 },
];

export const MONTHLY_TREND = [
  { month: "1月", counseling: 14, contracts: 6 },
  { month: "2月", counseling: 16, contracts: 7 },
  { month: "3月", counseling: 15, contracts: 6 },
  { month: "4月", counseling: 20, contracts: 9 },
  { month: "5月", counseling: 17, contracts: 9 },
  { month: "6月", counseling: 18, contracts: 11 },
];

export const STAFF_CONVERSION = [
  { name: "三浦（オーナー）", counseling: 6, contracts: 5 },
  { name: "佐藤 美咲", counseling: 7, contracts: 4 },
  { name: "高橋 里奈", counseling: 5, contracts: 2 },
];

export const KPI = {
  avgContractValue: 118000,
  practiceSessionsThisMonth: 9,
};

export const MENTORING = {
  nextSession: "2026-07-15",
  lastReport: {
    month: "6月",
    highlights: [
      "高橋さんの「不安の言語化」が前月より明確に改善",
      "提案前に価格の話を切り出すケースが減った（5件 → 1件）",
      "成約率 61%（前月 53%）— 全員が練習した「沈黙を待つ」が効いた",
    ],
    nextTheme: "クロージング — 『決めてください』と言わずに背中を押す",
  },
};

// ---------------------------------------------------------------
// AI接客練習（ロールプレイ）
// ---------------------------------------------------------------

export type RoleplayScenario = {
  id: string;
  title: string;
  customer: string;
  age: number;
  type: string;
  difficulty: 1 | 2 | 3;
  goal: string;
  /** AIお客様役の台本。スタッフの発話1回ごとに次の行へ進む。 */
  script: string[];
  opening: string;
};

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: "first-visit",
    title: "はじめての背中ケア相談",
    customer: "佐々木 由衣 様",
    age: 32,
    type: "不安型",
    difficulty: 1,
    goal: "不安を言葉にしてもらい、「原因から見る」価値を伝える",
    opening:
      "あの…背中のニキビがずっと治らなくて。皮膚科にも行ったんですけど、薬を塗ると一度きれいになって、やめるとまた繰り返しちゃって…。こういうのって、サロンでどうにかなるものなんですか？",
    script: [
      "そうなんですね…。正直、もう何を試せばいいのか分からなくなっていて。友達の結婚式が秋にあって、ドレスを着るのがこわいんです。",
      "原因、ですか？　考えたことなかったです。食べ物とか関係あるんですか？　甘いものはよく食べちゃうんですけど…。",
      "へえ…肌だけの問題じゃないかもしれないんですね。ちょっと安心しました、責められると思ってたので（笑）。それで、私の場合は何から始めればいいんでしょう？",
      "なるほど…。ちなみに、通うとしたらどれくらいのペースで来ることになりますか？　仕事が忙しくて、続けられるか不安で。",
      "分かりました。ちょっと前向きに考えてみたいです。今日、話せてよかったです。",
    ],
  },
  {
    id: "price-hesitation",
    title: "価格に迷うお客様",
    customer: "中村 佳奈 様",
    age: 41,
    type: "比較検討型",
    difficulty: 2,
    goal: "価格ではなく「繰り返さない価値」で比較の軸を変える",
    opening:
      "内容はいいなと思ったんですけど、正直、他のサロンより少しお高いですよね。近所に半額くらいのところもあって…何が違うんですか？",
    script: [
      "医師監修、ですか。それって実際、何がどう変わるんでしょう？　正直どこも「肌がきれいになります」としか言わないので、違いが分からなくて。",
      "うーん…。でも結局、通ってみないと分からないですよね。前に別のエステで回数券を買って、あまり変わらなかったことがあるんです。",
      "経過が手元に残るのは、ちょっといいですね。あれって家族にも見せられるんですか？　夫に相談しないと決められなくて。",
      "そうですか…。じゃあ一度、体験の結果を持ち帰って考えてもいいですか？",
    ],
  },
  {
    id: "past-failure",
    title: "他サロンで失敗した経験のある方",
    customer: "小林 恵 様",
    age: 38,
    type: "不信型",
    difficulty: 3,
    goal: "売り込まない。信頼の回復を最優先に、小さな一歩だけ合意する",
    opening:
      "先に言っておきたいんですけど、前のサロンで高いコースを契約して、ほとんど効果がなかったんです。正直、今日も半分疑いながら来ています。勧誘はしないでいただきたいです。",
    script: [
      "…そう言ってもらえるんですね。てっきり今日中に契約を迫られるのかと思っていました。じゃあ、聞くだけ聞いてもいいですか。",
      "前のところでは「体質だから続けないと治らない」って言われ続けて。でも何がどうなってるのかの説明は、一度もなかったんです。",
      "この図、分かりやすいですね…。私の場合もこれと同じことが起きてるんでしょうか？　検査とかで分かるものなんですか？",
      "検査結果を見てから決められるなら、それなら…。ただ、その検査だけ受けて、コースは断ってもいいんですよね？",
      "分かりました。それなら、検査だけまずお願いしてみます。",
    ],
  },
];

/** 練習後フィードバックの観点。クライアント側の採点で使う。 */
export const ROLEPLAY_RUBRIC = [
  {
    key: "empathy",
    label: "共感・受けとめ",
    hint: "「そうですよね」「不安でしたね」と、まず受けとめてから話す",
  },
  {
    key: "question",
    label: "質問で深掘り",
    hint: "こちらが話すより先に、お客様の状況を質問で引き出す",
  },
  {
    key: "mechanism",
    label: "原因・仕組みの説明",
    hint: "「なぜ繰り返すのか」を腸・食事などの原因から説明する",
  },
  {
    key: "no-rush-price",
    label: "価格を焦らない",
    hint: "信頼ができる前に金額の話を切り出さない",
  },
  {
    key: "next-step",
    label: "小さな次の一歩",
    hint: "契約を迫らず、検査・体験など「小さな合意」で締める",
  },
] as const;

export type RubricKey = (typeof ROLEPLAY_RUBRIC)[number]["key"];

// ---------------------------------------------------------------
// 顧客別の継続フォロー
// ---------------------------------------------------------------

export type TimelineKind =
  | "counseling"
  | "labtest"
  | "treatment"
  | "photo"
  | "line"
  | "note";

export type TimelineItem = {
  id: string;
  kind: TimelineKind;
  at: string; // YYYY-MM-DD
  title: string;
  body: string;
};

export type AccordCustomer = {
  id: string;
  name: string;
  age: number;
  status: "契約中" | "提案中" | "体験予約";
  statusNote: string;
  lineConsent: boolean;
  assignedTo: string;
  concern: string;
  nextAction: string;
  timeline: TimelineItem[];
};

export const ACCORD_CUSTOMERS: AccordCustomer[] = [
  {
    id: "suzuki",
    name: "鈴木 さやか",
    age: 32,
    status: "契約中",
    statusNote: "6ヶ月コース 3回目まで完了",
    lineConsent: true,
    assignedTo: "佐藤 美咲",
    concern: "背中ニキビの繰り返し（5年）。秋の結婚式でドレスを着たい。",
    nextAction: "7/2 の4回目来店時に、経過写真を一緒に見返す",
    timeline: [
      {
        id: "s0",
        kind: "labtest",
        at: "2026-05-10",
        title: "初回血液検査",
        body: "亜鉛・ビタミンD・フェリチンが低め。翻訳ガイドで「肌の材料が足りない状態」と図解つきで説明し、深い納得。再検査は6ヶ月後（11月頃）を提案。",
      },
      {
        id: "s1",
        kind: "counseling",
        at: "2026-05-10",
        title: "初回カウンセリング",
        body: "皮膚科で治療→再発を繰り返し。甘いものの習慣あり。検査の翻訳と腸のメカニズム図解に強い納得。6ヶ月コース成約。",
      },
      {
        id: "s2",
        kind: "photo",
        at: "2026-05-10",
        title: "施術前の写真を記録",
        body: "背中上部・中央の2点。ご本人確認のうえ保存。",
      },
      {
        id: "s3",
        kind: "line",
        at: "2026-05-10",
        title: "LINEで初回の経過ページを送付",
        body: "カウンセリング内容の要約と「今日のひとつ」を送付（同意取得済み）。",
      },
      {
        id: "s4",
        kind: "treatment",
        at: "2026-05-24",
        title: "2回目施術",
        body: "赤みが少し落ち着いた印象。ご本人も「かゆみが減った気がする」。",
      },
      {
        id: "s5",
        kind: "line",
        at: "2026-06-08",
        title: "3回目の経過写真をLINEで共有",
        body: "before/after を並べて送付。「家族に見せました！」と返信あり。",
      },
      {
        id: "s6",
        kind: "note",
        at: "2026-06-08",
        title: "フォローメモ",
        body: "モチベーション高い。次回、レッスン（腸のおはなし）を紹介するとよさそう。",
      },
    ],
  },
  {
    id: "nakamura",
    name: "中村 佳奈",
    age: 41,
    status: "提案中",
    statusNote: "体験後、ご主人と相談中",
    lineConsent: true,
    assignedTo: "高橋 里奈",
    concern: "他サロンとの価格比較で迷い中。過去に回数券で効果を感じられなかった経験。",
    nextAction: "6/30 までに「経過の見える化」サンプルをLINEで送付",
    timeline: [
      {
        id: "n1",
        kind: "counseling",
        at: "2026-06-14",
        title: "初回カウンセリング + 体験",
        body: "価格への迷いが中心。医師監修と経過共有に関心。即決は避け、持ち帰りに。",
      },
      {
        id: "n2",
        kind: "line",
        at: "2026-06-15",
        title: "体験結果をLINEで送付",
        body: "体験時の写真と説明図解を送付。ご主人に共有いただけるよう一言を添えた。",
      },
    ],
  },
  {
    id: "kobayashi",
    name: "小林 恵",
    age: 38,
    status: "体験予約",
    statusNote: "7/5 体験予約（検査のみ希望）",
    lineConsent: false,
    assignedTo: "三浦（オーナー）",
    concern: "他サロンでの契約失敗経験から強い警戒。勧誘NGの意思表示あり。",
    nextAction: "体験時は提案をせず、検査と説明のみ。LINE同意は無理に取らない",
    timeline: [
      {
        id: "k1",
        kind: "note",
        at: "2026-06-20",
        title: "電話での事前ヒアリング",
        body: "「勧誘はしないでほしい」と明確な要望。当日は検査のみで合意。",
      },
    ],
  },
];

// ---------------------------------------------------------------
// 経営コパイロット（v2）
// ---------------------------------------------------------------

export type CopilotSeverity = "attention" | "opportunity" | "info";

export type CopilotInsight = {
  id: string;
  severity: CopilotSeverity;
  title: string;
  body: string;
  /** 第1層（ルール）が検出した事実。数値つきで表示する。 */
  evidence: string[];
  action: {
    label: string;
    /** 実行先のトッピング（コパイロットは司令塔であることを可視化）。 */
    via: string;
    /** 遷移型アクションの場合のリンク先。 */
    href?: string;
  };
  /** 実行後に表示する効果測定の文言（デモ用の想定値）。 */
  doneEffect: string;
};

export const COPILOT_BRIEF: CopilotInsight[] = [
  {
    id: "revisit-drop",
    severity: "attention",
    title: "再診率が下がっています",
    body:
      "今週の再診率は 31%（先週 42%）。60日以上来店がなく、LINE同意のあるお客様が 42名います。",
    evidence: [
      "再診率: 42% → 31%（前週比 -11pt）",
      "60日以上未来店 × LINE同意あり: 42名",
      "うち施術3回以上の「戻りやすい」層: 17名",
    ],
    action: {
      label: "42名へのLINE一括フォローを準備する",
      via: "LINE経過共有",
    },
    doneEffect:
      "フォロー文面を準備しました（送信は確認後）。参考: 前回6月の同様フォローでは 38名中9名が再来店予約につながりました。",
  },
  {
    id: "retest-window",
    severity: "opportunity",
    title: "再検査の提案時期のお客様が 8名います",
    body:
      "初回の血液検査から6ヶ月前後のお客様が 8名。改善を数字で見せられる再検査は、継続とコース更新のいちばん強い理由になります。",
    evidence: [
      "初回検査から5〜7ヶ月: 8名（うちLINE同意あり 8名）",
      "うち経過写真で改善傾向: 6名",
      "前回の再検査提案: 7名中5名が受検 → 4名がコース継続",
    ],
    action: {
      label: "8名に再検査のご案内を準備する",
      via: "LINE経過共有",
    },
    doneEffect:
      "再検査のご案内を準備しました（送信は確認後）。数字の変化を翻訳ガイドで見せられるお客様から順に並べています。",
  },
  {
    id: "staff-strength",
    severity: "opportunity",
    title: "三浦さんの型に、勝ち筋があります",
    body:
      "三浦さんの成約率は平均より 12pt 高く、ヒアリング時間はむしろ短い傾向。「先に不安を言語化してから提案する」型が効いている可能性があります。",
    evidence: [
      "成約率: 三浦 83% / 店舗平均 61%",
      "平均ヒアリング時間: 三浦 28分 / 店舗平均 41分",
      "価格の話を切り出す位置: 会話の後半 84%（平均 52%）",
    ],
    action: {
      label: "この型を練習シナリオにして全員に配る",
      via: "AI接客練習",
      href: "/accord/roleplay",
    },
    doneEffect:
      "練習シナリオ「先に不安を言語化する型」を作成キューに入れました。来月の伴走テーマ候補にも追加済みです。",
  },
  {
    id: "cancel-cluster",
    severity: "info",
    title: "木曜夕方にキャンセルが集中しています",
    body:
      "直近4週の木曜 17時以降のキャンセル率は 18%（全体平均 7%）。リマインドを前日午前に前倒しすると改善する傾向があります。",
    evidence: [
      "木曜 17時以降のキャンセル率: 18%（12件/68件）",
      "全体平均: 7%",
      "リマインド前倒しの改善事例: 平均 -6pt",
    ],
    action: {
      label: "木曜枠のリマインドを前日午前に変更する",
      via: "継続フォロー",
    },
    doneEffect:
      "木曜枠のリマインド送信を前日 10:00 に変更しました。4週間後に効果を再計測してお知らせします。",
  },
];

/** 先週実行した提案の効果（ループが閉じることを見せるデモ）。 */
export const COPILOT_LAST_WINS = [
  "6/20 のLINE一括フォロー（38名）→ 9名が再来店予約（回収率 24%）",
  "「価格に迷うお客様」練習を全員実施 → 比較検討型の成約率 41% → 55%",
];

export const KIND_META: Record<
  TimelineKind,
  { label: string; emoji: string }
> = {
  counseling: { label: "カウンセリング", emoji: "📋" },
  labtest: { label: "血液検査", emoji: "🩸" },
  treatment: { label: "施術", emoji: "✋" },
  photo: { label: "写真", emoji: "📷" },
  line: { label: "LINE共有", emoji: "💬" },
  note: { label: "メモ", emoji: "📝" },
};
