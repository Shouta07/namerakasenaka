/**
 * 🌱 「腸のおはなし」 — 全7回のやさしい学習レッスン。
 *
 * エクシアクリニック先生 監修の医学トピックを「小学6年生レベル」のことばに
 * 翻訳した、Duolingo風（ただし押しつけない）の学びカード。
 *
 * 設計原則（§17 と §8.2 + §17 追加禁止表現を遵守）:
 *   - 1レッスン = 1〜3枚のソフトカード（各カード本文 50〜120 文字目安）。
 *   - 末尾に3択クイズ。explanation は不正解を絶対に責めない。
 *   - 専門用語は必ず「〜という意味です」風のグロスを添える。
 *   - レッスン完了で 1 バッジ。連続学習日数も伸びる。
 *
 * 監修クレジットは LESSON_AUTHOR_LABEL に集約してあるので、
 * 将来 Dr. の本名を入れたくなったら一カ所だけ書き換えれば反映される。
 */

/** ガイド全体の監修クレジット（チップ・カード見出し共通）。 */
// TODO: replace EXCIA_DOCTOR_LABEL with the doctor's real name when confirmed.
export const EXCIA_DOCTOR_LABEL = "エクシアクリニック先生 監修";
/** Legacy alias — same string, kept so older imports keep working. */
export const LESSON_AUTHOR_LABEL = EXCIA_DOCTOR_LABEL;

export type LessonCard = {
  heading: string;
  body: string;
};

export type LessonBadge = {
  id: string;
  name: string;
  emoji: string;
};

export type LessonQuiz = {
  question: string;
  options: [string, string, string];
  /** 0-indexed within options. */
  correctIndex: 0 | 1 | 2;
  explanation: string;
};

export type Lesson = {
  id: string;
  order: number;
  title: string;
  /** Card-header emoji — single glyph. */
  icon: string;
  badge: LessonBadge;
  cards: LessonCard[];
  quiz: LessonQuiz;
};

export const LESSONS: Lesson[] = [
  {
    id: "lesson-1-gut-map",
    order: 1,
    title: "おなかの地図",
    icon: "🗺",
    badge: { id: "badge-gut-map", name: "地図マスター", emoji: "🗺" },
    cards: [
      {
        heading: "食べものはどこを通る？",
        body: "口から入った食べものは、食道→胃→十二指腸（小腸の入り口）→小腸→大腸 の順で旅をします。やさしく覚えるだけで、おなかの話が一気にわかりやすくなります。",
      },
      {
        heading: "菌のすみかは「大腸」",
        body: "大腸は菌だらけ — これが本来の姿です。一方で「小腸」は本来、菌がとても少ない場所。掃除が行きとどいた廊下のようなイメージです。",
      },
      {
        heading: "覚え方のコツ",
        body: "大腸＝菌のおうち / 小腸＝菌の通り道。この区別が、つぎのお話「菌の渋滞」を理解する土台になります 🌱",
      },
    ],
    quiz: {
      question: "本来、菌がたくさんすんでいる場所はどこ？",
      options: ["小腸", "大腸", "胃"],
      correctIndex: 1,
      explanation:
        "正解は「大腸」でした 🌱 大腸は本来、菌のおうち。小腸は本来、菌がとても少ない場所です。覚えなくて大丈夫、いつでも見返せます。",
    },
  },
  {
    id: "lesson-2-sibo",
    order: 2,
    title: "菌の渋滞 — SIBO ってなに？",
    icon: "🚦",
    badge: { id: "badge-sibo", name: "渋滞ほどき", emoji: "🚦" },
    cards: [
      {
        heading: "本来いない場所に菌が増える",
        body: "大腸の菌が逆流して、本来菌がとても少ない「小腸」に増えてしまうことがあります。これを SIBO（Small Intestinal Bacterial Overgrowth = 小腸内細菌増殖症）と呼びます。",
      },
      {
        heading: "なにが起きる？",
        body: "増えすぎた菌が、食べものの糖を発酵させてガスをつくります。その結果、おなかの張り・便秘・下痢などのサインが出ることがあります。",
      },
      {
        heading: "覚えるならこれ一言",
        body: "「小腸の渋滞」— 道（小腸）に車（菌）が増えすぎて、流れが悪くなった状態です。ゆっくり整える方法があるので大丈夫です 🌱",
      },
    ],
    quiz: {
      question: "SIBO は、どこに菌が増えすぎる状態のことでしょう？",
      options: ["大腸", "小腸", "胃"],
      correctIndex: 1,
      explanation:
        "正解は「小腸」でした 🌱 SIBO は本来菌が少ない小腸に菌が増えてしまう状態のこと。読み終わってくださってありがとうございます。",
    },
  },
  {
    id: "lesson-3-fructan",
    order: 3,
    title: "玉ねぎ・小麦でおなかが張る理由",
    icon: "🌾",
    badge: { id: "badge-fructan", name: "フルクタン博士", emoji: "🌾" },
    cards: [
      {
        heading: "「フルクタン」というキーワード",
        body: "玉ねぎや小麦などに多く入っている、菌の大好物の糖の仲間です。「フルクタン」＝菌のごちそう、という意味で覚えてください。",
      },
      {
        heading: "FODMAP（フォドマップ）の食べもの",
        body: "フルクタンを含む、菌が発酵させやすい食材たちをまとめて FODMAP と呼びます。代表は 玉ねぎ・ニンニク・小麦・りんご・はちみつ・牛乳。",
      },
      {
        heading: "張りやすいだけで、悪者ではありません",
        body: "FODMAP の食材は、SIBO のときに「いまはちょっとお休み」する候補。あなたのからだの調子に合わせて、無理なく試していけます 🌱",
      },
    ],
    quiz: {
      question: "「フルクタン」とは何でしょう？",
      options: [
        "菌が大好きな糖の仲間",
        "ビタミンの一種",
        "肌の表面を守る成分",
      ],
      correctIndex: 0,
      explanation:
        "正解は「菌が大好きな糖の仲間」でした 🌱 玉ねぎや小麦に多く、菌がよろこんで発酵させるためにガスができやすくなります。",
    },
  },
  {
    id: "lesson-4-lactic-not-always",
    order: 4,
    title: "乳酸菌が逆効果になることもあります",
    icon: "🥛",
    badge: { id: "badge-lactic-wisdom", name: "やさしい知恵", emoji: "🥛" },
    cards: [
      {
        heading: "「とりあえず乳酸菌」が合わない場合",
        body: "腸内に菌の渋滞（SIBO）がある状態で、さらに乳酸菌を足すと、菌どうしの大戦争になりおなかがもっと張ることがあります。",
      },
      {
        heading: "だから順番が大事",
        body: "渋滞があるかどうかを先に検査で確かめてから、必要なら少しずつ整えていく。これが「逆効果にしない」やさしいやり方です。",
      },
      {
        heading: "迷ったら相談してください",
        body: "サプリやヨーグルトをどうしようか迷ったら、サロンや先生に一言お声がけください。あなたの状態に合わせてご一緒に考えます 🌱",
      },
    ],
    quiz: {
      question: "SIBO がある状態で、いきなり乳酸菌をたくさん足すとどうなりやすい？",
      options: [
        "すぐに肌がなめらかになる",
        "おなかの張りがさらに強くなることがある",
        "とくに何も変わらない",
      ],
      correctIndex: 1,
      explanation:
        "正解は「おなかの張りがさらに強くなることがある」でした 🌱 だから順番が大切。おしいときも、おしくないときも、いつでも見返せます。",
    },
  },
  {
    id: "lesson-5-order-of-care",
    order: 5,
    title: "まず「整える」順序",
    icon: "🛠",
    badge: { id: "badge-craftsman", name: "整え職人", emoji: "🛠" },
    cards: [
      {
        heading: "ステップ① 渋滞をほどく",
        body: "まずは菌の渋滞（SIBO）をやさしく落ち着かせます。FODMAP をいったん控えめにする、というのもこの段階のお話です。",
      },
      {
        heading: "ステップ② 善玉菌のごはん",
        body: "つぎに、善玉菌が育ちやすいエサ（プレバイオティクス）や、菌の死骸（ポストバイオティクスという意味です）で土壌を整えます。穏やかなステップです。",
      },
      {
        heading: "ステップ③ 生きた菌",
        body: "土が整ったところに、生きた菌（プロバイオティクス）をそっと加えます。②③は順番を守ると安全。①なしで③に飛ぶと逆効果になることもあります 🌱",
      },
    ],
    quiz: {
      question: "腸を整えるとき、いちばん最初にやるとよいのは？",
      options: [
        "生きた菌をたくさんとる",
        "菌の渋滞をやさしくほどく",
        "ヨーグルトを毎日食べる",
      ],
      correctIndex: 1,
      explanation:
        "正解は「菌の渋滞をやさしくほどく」でした 🌱 順番を守ることが、逆効果にしないコツです。覚えなくて大丈夫、何度でも読めます。",
    },
  },
  {
    id: "lesson-6-butyrate",
    order: 6,
    title: "酪酸菌 — 腸の修理屋さん",
    icon: "🌱",
    badge: { id: "badge-butyrate-friend", name: "酪酸のお友達", emoji: "🌱" },
    cards: [
      {
        heading: "「酪酸菌」ってなに？",
        body: "酪酸（らくさん）という短い脂肪酸をつくる菌のこと。地味だけど、腸のなかで大事な仕事をしてくれる縁の下の力もちです。",
      },
      {
        heading: "酪酸は大腸の細胞のごはん",
        body: "酪酸は、大腸のかべをつくる細胞のエネルギー源になります。つまり「家の修理に必要な材料」のような存在、という意味です。",
      },
      {
        heading: "炎症をやわらげる",
        body: "酪酸があると、腸のかべがしっかり保たれて、よけいな炎症もおきにくくなる、と言われています。酪酸菌は、静かなお守りのような菌です 🌱",
      },
    ],
    quiz: {
      question: "酪酸（らくさん）は、おもにどんな働きをしてくれますか？",
      options: [
        "腸のかべの細胞のごはんになる",
        "胃酸を強くする",
        "髪の毛のつやを出す",
      ],
      correctIndex: 0,
      explanation:
        "正解は「腸のかべの細胞のごはんになる」でした 🌱 酪酸は腸のお守り。直接覚えなくても、サロンでまたお話ししますね。",
    },
  },
  {
    id: "lesson-7-back-connection",
    order: 7,
    title: "だから背中に出る — つながりの話",
    icon: "💖",
    badge: { id: "badge-connection", name: "つながり発見", emoji: "💖" },
    cards: [
      {
        heading: "腸の炎症は、からだ全体の炎症に",
        body: "腸のかべがゆるんだ状態（リーキーガット傾向）が続くと、ささやかな炎症が全身に広がりやすくなる、と言われています。",
      },
      {
        heading: "命に関わらない場所は後回し",
        body: "からだは賢いので、命に関わる場所を先に守ります。肌は、命に直結しない場所なので、「最後の最後」に整いやすい場所です。",
      },
      {
        heading: "だから肌は「最後に応える」",
        body: "腸が整って、全身の炎症がしずまると、ようやく肌が応えてくれます。背中の変化は遅く見えても、確実に、内側から来ているお返事です 🌱",
      },
    ],
    quiz: {
      question: "なぜ腸が整っても、肌の変化はゆっくり遅れて感じられるのでしょう？",
      options: [
        "肌はからだの中で「命に直結しない」場所だから、最後に応える",
        "肌は腸とは関係がないから",
        "腸が整うと肌はすぐに変わるから",
      ],
      correctIndex: 0,
      explanation:
        "正解は「肌は『命に直結しない』場所だから、最後に応える」でした 🌱 だから少しずつ。あなたの背中は、ちゃんと内側からのお返事を待っています。",
    },
  },
];

/** Convenience — total lesson count, used in copy and progress bars. */
export const LESSON_TOTAL = LESSONS.length;

/** Lookup helpers. */
export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getLessonByOrder(order: number): Lesson | undefined {
  return LESSONS.find((l) => l.order === order);
}
