/**
 * 回復ガイド（三社共同開発）デモフィクスチャ。
 *
 * - エクシアクリニックの検査結果を「翻訳・教育・伴走」するモジュールのサンプル。
 * - すべての文言は §8.2 + §17 の禁止語フィルタを通過すること（テストで担保）。
 * - 断定しない / 不安を煽らない / 顧客を責めない / 小6レベルのやさしさ。
 */

import type { RecoveryGuideJson } from "@/lib/guide/schema";
import { daysAgoIso } from "@/lib/demo/time";
import { demoOrganization } from "@/lib/demo/fixtures";

export type DemoGuideCustomer = {
  id: string;
  organizationId: string;
  clientId: string | null;
  name: string;
  age: number | null;
  concern: string;
  shareToken: string;
  createdAt: string;
  updatedAt: string;
};

export type DemoHealthRecord = {
  id: string;
  guideCustomerId: string;
  testResultMemo: string;
  doctorComment: string;
  salonMemo: string;
  dietaryRestrictions: string;
  currentProblem: string;
  aiSummaryJson: RecoveryGuideJson | null;
  aiGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DemoDailyCheck = {
  id: string;
  guideCustomerId: string;
  /** YYYY-MM-DD */
  date: string;
  actionDone: boolean;
  skinCondition: number | null;
  bodyCondition: number | null;
  memo: string | null;
  createdAt: string;
};

export const TAMURA_GUIDE_CUSTOMER_ID = "guide-tamura-demo";
export const TAMURA_SHARE_TOKEN = "tamura-demo-2026";

/**
 * 田村洋子さんのプリ生成ガイド。
 * ANTHROPIC_API_KEY 未設定時の generateRecoveryGuide のデモ出力にも使う。
 */
export const TAMURA_SAMPLE_GUIDE: RecoveryGuideJson = {
  today_summary:
    "今のあなたの背中ニキビは、腸の炎症や食事への反応が関係している可能性があります。検査の結果をもとに、からだの内側から少しずつ整えていきましょう。",
  current_body_state:
    "検査では、腸の中に「カンジダ菌」というカビの仲間が多めにいることと、腸の壁が少し敏感になっている傾向（リーキーガット傾向）が見つかりました。\n\nまた、乳製品・卵・グルテン（小麦）に、いまのあなたのからだが反応しやすい状態のようです。牛肉にも、ほどほどの反応がありました。\n\nこれはあなたの努力が足りないからではなく、いまのからだがそういう状態にある、というだけのことです。先生の方針に沿って、ゆっくり整えていけます。",
  relation_to_back_acne:
    "腸の壁が敏感になっていると、食べたものの一部が刺激になって、肌に炎症が出やすくなることがあると言われています。\n\n背中は皮脂の出口が多い場所なので、その影響があらわれやすい場所のひとつです。腸にやさしい食事を続けることは、肌が落ち着きやすい環境づくりにつながる可能性があります。",
  easy_explanations: [
    {
      term: "リーキーガット",
      explanation:
        "腸の壁が少しゆるんで、すき間ができやすくなっている状態のことです。そこから食べものの細かい粒が入り込み、からだが「守らなきゃ」と反応してしまうことがあります。腸にやさしい食事と休息で、少しずつ整えていける部分です。",
    },
    {
      term: "腸内カンジダ菌",
      explanation:
        "だれのおなかにもいる、カビの仲間の菌です。甘いものや疲れなどがきっかけで増えすぎると、腸のはたらきが乱れやすくなります。増えすぎた分を、食事の工夫で少しずつ落ち着かせていくのが今回の方針です。",
    },
    {
      term: "IgGフードアレルギー",
      explanation:
        "食べてすぐ症状が出るアレルギーとは別の、「ゆっくり型」の反応を調べる検査です。数値が高い食べものは、いまのあなたのからだが少しお疲れ気味というサインかもしれません。一生食べられない、という意味ではありません。",
    },
    {
      term: "カゼイン",
      explanation:
        "牛乳やチーズなどの乳製品に含まれるたんぱく質の名前です。今回の検査では、あなたのからだがカゼインに反応しやすい状態でした。しばらくお休みして、腸を休ませてあげましょう。",
    },
    {
      term: "グルテン",
      explanation:
        "パンやパスタなど、小麦に含まれるたんぱく質です。生地のもちもちのもとになる成分ですが、腸が敏感なときは負担になりやすいと言われています。お米中心の食事なら、無理なく置きかえられます。",
    },
  ],
  avoid_foods: [
    "乳製品（牛乳・チーズ・ヨーグルト）",
    "卵",
    "小麦製品（パン・パスタ・うどん）",
    "牛肉（回数を少なめに）",
    "砂糖の多いお菓子",
  ],
  recommended_foods: [
    "魚（焼き魚・煮魚・刺身）",
    "豚肉・ラム肉",
    "お米・雑穀",
    "野菜・きのこ",
    "味噌汁などの発酵食品（乳製品以外）",
  ],
  weekly_actions: [
    "乳製品を控える",
    "外食では焼き魚定食を選ぶ",
    "朝は白湯か味噌汁から始める",
  ],
  monthly_policy:
    "今月は「腸を休ませる月」です。反応の出やすい食材をいったんお休みして、お米と魚を中心にしたやさしい和食を続けてみましょう。\n\n完璧でなくて大丈夫。7割できれば十分です。来月のカウンセリングで、肌とからだの変化を一緒に確かめていきましょう。",
  encouraging_message:
    "食事を変えるのは、思っているよりずっと大きな一歩です。できた日はもちろん、できなかった日があっても、あなたの価値は何も変わりません。からだはゆっくり、自分のペースで応えてくれます。私たちが伴走しますので、安心して進んでいきましょう。",
  next_counseling_points: [
    "乳製品を控えてみて、からだや肌に変化を感じたか",
    "続けにくかった場面（外食・忙しい日・甘いものが欲しい日など）",
    "肌の調子の記録で気づいたこと",
    "次の1ヶ月で増やせそうな「食べてよいもの」",
  ],
  result_mappings: [
    {
      finding: "腸内カンジダ菌がやや多め",
      meaning: "腸の中の菌のバランスが揺らいでいる可能性があります",
      action: "甘いものを少し控えて、発酵食品（乳製品以外）をとり入れてみましょう",
    },
    {
      finding: "ゾヌリン値が高め（リーキーガット傾向）",
      meaning: "腸の壁が敏感になり、刺激が肌にあらわれやすい状態かもしれません",
      action: "お米と魚を中心にした、腸にやさしい和食を続けてみましょう",
    },
    {
      finding: "乳製品・卵・グルテンに高めの反応",
      meaning: "いまのからだには、少し負担になりやすい食材の可能性があります",
      action: "先生の方針に沿って、3ヶ月を目安にいったんお休みしてみましょう",
    },
    {
      finding: "牛肉に中程度の反応",
      meaning: "完全にやめなくても、回数をへらすだけで負担が軽くなる可能性があります",
      action: "牛肉は週1回までを目安に、豚肉やラム肉に置きかえてみましょう",
    },
  ],
};

export const DEMO_GUIDE_CUSTOMERS: DemoGuideCustomer[] = [
  {
    id: TAMURA_GUIDE_CUSTOMER_ID,
    organizationId: demoOrganization.id,
    // デモのログイン顧客（client-yamada）に紐付け、/c/guide からも
    // 同じガイド・同じデイリーチェックを参照できるようにする（§17）。
    clientId: "client-yamada",
    name: "田村 洋子",
    age: 42,
    concern: "背中ニキビ、肌荒れ、食事制限が続くか不安",
    shareToken: TAMURA_SHARE_TOKEN,
    createdAt: daysAgoIso(12, 11),
    updatedAt: daysAgoIso(11, 15),
  },
];

export const DEMO_HEALTH_RECORDS: DemoHealthRecord[] = [
  {
    id: "health-tamura-demo",
    guideCustomerId: TAMURA_GUIDE_CUSTOMER_ID,
    testResultMemo:
      "【エクシアクリニック検査結果】\n・IgGフードアレルギー検査：乳製品（カゼイン）・卵白・グルテンに高反応。牛肉に中程度反応。魚・豚肉・ラム肉・野菜・米は低反応で取り入れやすい。\n・腸内環境検査：カンジダ菌が基準値より高め。ゾヌリン値も高めでリーキーガット傾向あり。",
    doctorComment:
      "腸内のカンジダ増加とリーキーガット傾向が見られます。まずは3ヶ月を目安に、反応の強い食材（乳製品・卵・小麦）を控える食事を提案します。たんぱく源は魚・豚・ラムを中心に。経過は次回の再検査で確認しましょう。無理のない範囲で続けることが大切です。",
    salonMemo:
      "初回カウンセリング済み。食事制限が続けられるか不安が強め。仕事のランチは外食が多く、置きかえメニューの具体的な提案が必要。背中は上部に炎症性のニキビ、乾燥傾向もあり。励まし多めの伴走を心がける。",
    dietaryRestrictions:
      "乳製品・卵・グルテンを控える（先生の方針）。牛肉は週1回までを目安に。",
    currentProblem:
      "ランチの外食で何を選べばよいか分からない。甘いものをやめられない日がある。このまま続けられるか不安。",
    aiSummaryJson: TAMURA_SAMPLE_GUIDE,
    aiGeneratedAt: daysAgoIso(11, 15),
    createdAt: daysAgoIso(12, 11),
    updatedAt: daysAgoIso(11, 15),
  },
];

function dateOnly(daysAgo: number): string {
  return daysAgoIso(daysAgo, 9).slice(0, 10);
}

/**
 * チェック履歴 — デモ用のストーリー（§17 達成と祝福）:
 *
 * - 8日ぶん記録（実践6日 / おやすみ2日）、肌の調子は 2 → 4 へゆっくり上向き。
 * - 最初の4日連続（10〜7日前）で「3日」マイルストーン達成済み。
 * - 6〜5日前は記録のおやすみ（連続が一度切れる — 責めない設計の見せ場）。
 * - 4日前〜昨日で再び4日連続 → 現在の連続記録は4日。「7日」はこれから。
 * - 「今日」は未記録: デモ中にその場で記録すると連続5日に伸びて見える。
 */
export const DEMO_DAILY_CHECKS: DemoDailyCheck[] = [
  {
    id: "check-tamura-10",
    guideCustomerId: TAMURA_GUIDE_CUSTOMER_ID,
    date: dateOnly(10),
    actionDone: true,
    skinCondition: 2,
    bodyCondition: 2,
    memo: "初日。牛乳をやめて豆乳にしてみた",
    createdAt: daysAgoIso(10, 21),
  },
  {
    id: "check-tamura-9",
    guideCustomerId: TAMURA_GUIDE_CUSTOMER_ID,
    date: dateOnly(9),
    actionDone: true,
    skinCondition: 2,
    bodyCondition: 3,
    memo: null,
    createdAt: daysAgoIso(9, 22),
  },
  {
    id: "check-tamura-8",
    guideCustomerId: TAMURA_GUIDE_CUSTOMER_ID,
    date: dateOnly(8),
    actionDone: false,
    skinCondition: 2,
    bodyCondition: 2,
    memo: "会食でチーズを少し。気にしすぎないようにする",
    createdAt: daysAgoIso(8, 23),
  },
  {
    id: "check-tamura-7",
    guideCustomerId: TAMURA_GUIDE_CUSTOMER_ID,
    date: dateOnly(7),
    actionDone: true,
    skinCondition: 3,
    bodyCondition: 3,
    memo: null,
    createdAt: daysAgoIso(7, 21),
  },
  // 6〜5日前: 記録のおやすみ（意図的なギャップ — 連続記録が一度切れる）。
  {
    id: "check-tamura-4",
    guideCustomerId: TAMURA_GUIDE_CUSTOMER_ID,
    date: dateOnly(4),
    actionDone: true,
    skinCondition: 3,
    bodyCondition: 3,
    memo: "ランチに焼き魚定食。おいしかった",
    createdAt: daysAgoIso(4, 21),
  },
  {
    id: "check-tamura-3",
    guideCustomerId: TAMURA_GUIDE_CUSTOMER_ID,
    date: dateOnly(3),
    actionDone: true,
    skinCondition: 3,
    bodyCondition: 4,
    memo: "朝の味噌汁が習慣になってきた",
    createdAt: daysAgoIso(3, 21),
  },
  {
    id: "check-tamura-2",
    guideCustomerId: TAMURA_GUIDE_CUSTOMER_ID,
    date: dateOnly(2),
    actionDone: false,
    skinCondition: 4,
    bodyCondition: 3,
    memo: null,
    createdAt: daysAgoIso(2, 22),
  },
  {
    id: "check-tamura-1",
    guideCustomerId: TAMURA_GUIDE_CUSTOMER_ID,
    date: dateOnly(1),
    actionDone: true,
    skinCondition: 4,
    bodyCondition: 4,
    memo: "背中のざらつきが少しやわらいだ気がする",
    createdAt: daysAgoIso(1, 21),
  },
];
