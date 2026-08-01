/**
 * Self-contained demo fixtures for the salon CRM.
 *
 * Goals:
 * - No Supabase calls.
 * - Realistic Japanese phrasing that complies with §8.2 banned-word list.
 * - Each AI / nutritionist feedback ends with the §4.4.4 disclaimer.
 * - All photo slots are `null` `signedUrl`s — the UI renders the
 *   BackPhotoPlaceholder component, which makes week 1 vs week 4 visually
 *   tell the improvement story without random photos.
 */

import {
  type AppointmentStatus,
  type FeedbackStatus,
  type MealType,
  type PhotoType,
} from "@/types/domain";
import { DISCLAIMER } from "@/lib/compliance/banned-words";
import { daysAgoIso, daysAheadIso, minutesAgoIso, hoursAgoIso } from "@/lib/demo/time";
import type { BackPhotoSeverity, BackPhotoLighting } from "@/components/progress/back-photo-placeholder";

export type DemoOrganization = {
  id: string;
  /** テナント（店舗）名。顧客画面のヘッダーなどに出る。 */
  name: string;
  /** 署名・差出人表示に使う短い呼び名。 */
  shortName: string;
  planName: string;
  billingMode: "B2B_ONLY" | "B2C_ONLY" | "DUAL";
};

/**
 * デモ用テナント。特定の店舗名はハードコードしない —
 * 顧客向け画面は「導入店舗の名前」を出すのが正しく、
 * 汎用SaaSのデモとしても固有名が出てはいけない。
 */
export const demoOrganization: DemoOrganization = {
  id: "org-demo-salon",
  name: "背中ケアサロン 表参道店",
  shortName: "背中ケアサロン",
  planName: "Pro プラン（B2B + B2C）",
  billingMode: "DUAL",
};

export type DemoClient = {
  id: string;
  displayName: string;
  furigana: string;
  ageRange: string;
  skinType: string;
  courseName: string;
  primaryTherapistName: string;
  startedOn: string;
  sessionsCompleted: number;
  sessionsTotal: number;
  /** Kept for compatibility; no longer used to fetch a real image. */
  avatarUrl: string;
};

export const demoClient: DemoClient = {
  id: "client-yamada",
  displayName: "田中 太郎",
  furigana: "たなか たろう",
  ageRange: "30代",
  skinType: "敏感肌・乾燥傾向",
  courseName: "背中ケア 6 ヶ月コース",
  primaryTherapistName: "佐藤 美咲",
  startedOn: daysAgoIso(90, 10).slice(0, 10),
  sessionsCompleted: 3,
  sessionsTotal: 6,
  avatarUrl: "",
};

export const demoClientRoster: DemoClient[] = [
  demoClient,
  {
    id: "client-suzuki",
    displayName: "鈴木 麻衣",
    furigana: "すずき まい",
    ageRange: "40代",
    skinType: "混合肌",
    courseName: "背中ケア 3 ヶ月コース",
    primaryTherapistName: "佐藤 美咲",
    startedOn: daysAgoIso(60, 10).slice(0, 10),
    sessionsCompleted: 2,
    sessionsTotal: 3,
    avatarUrl: "",
  },
  {
    id: "client-tanaka",
    displayName: "井上 由美",
    furigana: "いのうえ ゆみ",
    ageRange: "20代",
    skinType: "脂性肌",
    courseName: "背中ケア 6 ヶ月コース",
    primaryTherapistName: "高橋 葵",
    startedOn: daysAgoIso(112, 10).slice(0, 10),
    sessionsCompleted: 5,
    sessionsTotal: 6,
    avatarUrl: "",
  },
  {
    id: "client-kato",
    displayName: "加藤 れい",
    furigana: "かとう れい",
    ageRange: "30代",
    skinType: "敏感肌",
    courseName: "背中ケア 6 ヶ月コース",
    primaryTherapistName: "佐藤 美咲",
    startedOn: daysAgoIso(75, 10).slice(0, 10),
    sessionsCompleted: 2,
    sessionsTotal: 6,
    avatarUrl: "",
  },
  // 8 customers total per spec.
  {
    id: "client-kimura",
    displayName: "木村 まな",
    furigana: "きむら まな",
    ageRange: "30代",
    skinType: "乾燥肌",
    courseName: "背中ケア 6 ヶ月コース",
    primaryTherapistName: "佐藤 美咲",
    startedOn: daysAgoIso(56, 10).slice(0, 10),
    sessionsCompleted: 4,
    sessionsTotal: 6,
    avatarUrl: "",
  },
  {
    id: "client-takahashi",
    displayName: "高橋 ゆり",
    furigana: "たかはし ゆり",
    ageRange: "40代",
    skinType: "敏感肌",
    courseName: "背中ケア 6 ヶ月コース",
    primaryTherapistName: "高橋 葵",
    startedOn: daysAgoIso(84, 10).slice(0, 10),
    sessionsCompleted: 4,
    sessionsTotal: 6,
    avatarUrl: "",
  },
  {
    id: "client-watanabe",
    displayName: "渡辺 さくら",
    furigana: "わたなべ さくら",
    ageRange: "20代",
    skinType: "混合肌",
    courseName: "背中ケア 3 ヶ月コース",
    primaryTherapistName: "中村 真奈",
    startedOn: daysAgoIso(14, 10).slice(0, 10),
    sessionsCompleted: 1,
    sessionsTotal: 3,
    avatarUrl: "",
  },
  {
    id: "client-nakamura",
    displayName: "中村 みき",
    furigana: "なかむら みき",
    ageRange: "30代",
    skinType: "普通肌",
    courseName: "背中ケア 6 ヶ月コース",
    primaryTherapistName: "佐藤 美咲",
    startedOn: daysAgoIso(112, 10).slice(0, 10),
    sessionsCompleted: 6,
    sessionsTotal: 6,
    avatarUrl: "",
  },
  {
    id: "client-kobayashi",
    displayName: "小林 ひかる",
    furigana: "こばやし ひかる",
    ageRange: "30代",
    skinType: "敏感肌",
    courseName: "背中ケア 6 ヶ月コース",
    primaryTherapistName: "高橋 葵",
    startedOn: daysAgoIso(42, 10).slice(0, 10),
    sessionsCompleted: 3,
    sessionsTotal: 6,
    avatarUrl: "",
  },
];

export type DemoTherapist = {
  id: string;
  name: string;
  role: "lead" | "senior" | "junior";
};

export const demoTherapists: DemoTherapist[] = [
  { id: "th-sato", name: "佐藤 美咲", role: "lead" },
  { id: "th-takahashi", name: "高橋 葵", role: "senior" },
  { id: "th-nakamura", name: "中村 真奈", role: "junior" },
];

/**
 * 背中の状態評価。撮影のたびにサロン／クリニックが付ける。
 *
 * 炎症と色素沈着は別々に持つ。色素は遅れて改善するので、ひとつの指標に
 * まとめると「効いていない」に見えてしまう。
 */
export type DemoSkinAssessment = {
  /** 対応する経過写真。 */
  photoId: string;
  assessedOn: string; // ISO
  /** 0（落ち着いている）〜5（強い）。 */
  inflammation: number;
  /** 0（目立たない）〜5（濃い）。 */
  pigmentation: number;
  /** 評価した人。 */
  assessedBy: string;
  note: string;
};

export const demoSkinAssessments: DemoSkinAssessment[] = [
  {
    photoId: "photo-y-w1",
    assessedOn: daysAgoIso(84, 10),
    inflammation: 4,
    pigmentation: 4,
    assessedBy: "佐藤 美咲",
    note: "赤みが広い範囲に出ています。まずは触らないことから。",
  },
  {
    photoId: "photo-y-w2",
    assessedOn: daysAgoIso(63, 11),
    inflammation: 3,
    pigmentation: 4,
    assessedBy: "佐藤 美咲",
    note: "赤みの範囲が少し狭くなってきました。",
  },
  {
    photoId: "photo-y-w3",
    assessedOn: daysAgoIso(35, 10),
    inflammation: 2,
    pigmentation: 4,
    assessedBy: "佐藤 美咲",
    note: "新しくできる数が減っています。跡はこれからの時期です。",
  },
  {
    photoId: "photo-y-w4",
    assessedOn: daysAgoIso(7, 11),
    inflammation: 1,
    pigmentation: 3,
    assessedBy: "佐藤 美咲",
    note: "落ち着いてきました。色素は時間がかかるところなので、日焼け対策を続けましょう。",
  },
];

/** 担当セラピストから顧客への「ひとこと」— 進捗ページの温度を作るデモデータ。 */
export type DemoTherapistCheer = {
  clientId: string;
  therapistName: string;
  writtenAt: string; // ISO
  body: string;
};

export const demoTherapistCheer: DemoTherapistCheer = {
  clientId: demoClient.id,
  therapistName: demoClient.primaryTherapistName,
  writtenAt: daysAgoIso(7, 12),
  body: "折り返しの3回目、おつかれさまでした。写真を並べてみると、ご自身の実感メモも少しずつ明るくなっていて、私もうれしいです。ここからの3回は、ホームケアの保湿をもう一歩ていねいにやってみましょう。次回、やり方を一緒におさらいしますね。",
};

export type DemoProgressPhoto = {
  id: string;
  clientId: string;
  takenAt: string; // ISO
  photoType: PhotoType;
  caption: string;
  selfRating: number | null;
  signedUrl: string | null;
  /** Optional severity for the SVG placeholder. */
  severity?: BackPhotoSeverity;
  /** Optional lighting variant for the SVG placeholder. */
  lighting?: BackPhotoLighting;
};

export const demoProgressPhotos: DemoProgressPhoto[] = [
  // Yamada — 4 weeks of progress (week 1 high → week 4 low).
  {
    id: "photo-y-w1",
    clientId: demoClient.id,
    takenAt: daysAgoIso(84, 10),
    photoType: "before",
    caption: "初回カウンセリング時。背中の状態を記録。",
    selfRating: 2,
    signedUrl: null,
    severity: "high",
    lighting: "cool",
  },
  {
    id: "photo-y-w2",
    clientId: demoClient.id,
    takenAt: daysAgoIso(63, 11),
    photoType: "after",
    caption: "2 回目施術後。トリートメント直後の状態。",
    selfRating: 3,
    signedUrl: null,
    severity: "medium",
    lighting: "warm",
  },
  {
    id: "photo-y-w3",
    clientId: demoClient.id,
    takenAt: daysAgoIso(35, 10),
    photoType: "after",
    caption: "4 回目施術後。日常のホームケアを継続中。",
    selfRating: 4,
    signedUrl: null,
    severity: "low",
    lighting: "cool",
  },
  {
    id: "photo-y-w4",
    clientId: demoClient.id,
    takenAt: daysAgoIso(7, 11),
    photoType: "after",
    caption: "5 回目施術後。コンディションが落ち着いてきた感覚あり。",
    selfRating: 5,
    signedUrl: null,
    severity: "clear",
    lighting: "warm",
  },
  // Kimura — improving steadily over 8 weeks.
  {
    id: "photo-k-w1",
    clientId: "client-kimura",
    takenAt: daysAgoIso(56, 10),
    photoType: "before",
    caption: "初回。",
    selfRating: 2,
    signedUrl: null,
    severity: "high",
    lighting: "cool",
  },
  {
    id: "photo-k-w4",
    clientId: "client-kimura",
    takenAt: daysAgoIso(28, 10),
    photoType: "after",
    caption: "4 週時点。",
    selfRating: 3,
    signedUrl: null,
    severity: "medium",
    lighting: "warm",
  },
  {
    id: "photo-k-w8",
    clientId: "client-kimura",
    takenAt: daysAgoIso(3, 10),
    photoType: "after",
    caption: "8 週時点。",
    selfRating: 4,
    signedUrl: null,
    severity: "low",
    lighting: "warm",
  },
  // Nakamura — completed course, high satisfaction.
  {
    id: "photo-n-before",
    clientId: "client-nakamura",
    takenAt: daysAgoIso(112, 10),
    photoType: "before",
    caption: "初回カウンセリング時。",
    selfRating: 2,
    signedUrl: null,
    severity: "high",
    lighting: "cool",
  },
  {
    id: "photo-n-mid",
    clientId: "client-nakamura",
    takenAt: daysAgoIso(56, 10),
    photoType: "after",
    caption: "中盤。",
    selfRating: 4,
    signedUrl: null,
    severity: "low",
    lighting: "warm",
  },
  {
    id: "photo-n-final",
    clientId: "client-nakamura",
    takenAt: daysAgoIso(7, 10),
    photoType: "after",
    caption: "最終回。",
    selfRating: 5,
    signedUrl: null,
    severity: "clear",
    lighting: "warm",
  },
  // Tanaka — week 16, mostly complete.
  {
    id: "photo-t-w1",
    clientId: "client-tanaka",
    takenAt: daysAgoIso(98, 10),
    photoType: "before",
    caption: "初回。",
    selfRating: 2,
    signedUrl: null,
    severity: "high",
    lighting: "cool",
  },
  {
    id: "photo-t-w16",
    clientId: "client-tanaka",
    takenAt: daysAgoIso(10, 11),
    photoType: "after",
    caption: "5 回目施術後。",
    selfRating: 4,
    signedUrl: null,
    severity: "low",
    lighting: "warm",
  },
];

export type DemoAppointment = {
  id: string;
  clientId: string;
  clientName: string;
  therapistName: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  menuName: string;
};

/** Today's salon date — useful when filtering appointments. */
export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export const demoAppointments: DemoAppointment[] = [
  // Today's appointments — spread across the day.
  {
    id: "appt-today-1",
    clientId: "client-tanaka",
    clientName: "井上 由美",
    therapistName: "高橋 葵",
    scheduledAt: daysAgoIso(0, 10, 0),
    durationMinutes: 90,
    status: "confirmed",
    menuName: "背中トリートメント 90 分",
  },
  {
    id: "appt-today-2",
    clientId: "client-suzuki",
    clientName: "鈴木 麻衣",
    therapistName: "佐藤 美咲",
    scheduledAt: daysAgoIso(0, 11, 30),
    durationMinutes: 90,
    status: "confirmed",
    menuName: "背中トリートメント 90 分",
  },
  {
    id: "appt-today-3",
    clientId: demoClient.id,
    clientName: demoClient.displayName,
    therapistName: "佐藤 美咲",
    scheduledAt: daysAgoIso(0, 13, 30),
    durationMinutes: 90,
    status: "confirmed",
    menuName: "背中トリートメント 90 分",
  },
  {
    id: "appt-today-4",
    clientId: "client-kimura",
    clientName: "木村 まな",
    therapistName: "佐藤 美咲",
    scheduledAt: daysAgoIso(0, 15, 0),
    durationMinutes: 90,
    status: "confirmed",
    menuName: "背中トリートメント 90 分",
  },
  {
    id: "appt-today-5",
    clientId: "client-kato",
    clientName: "加藤 れい",
    therapistName: "佐藤 美咲",
    scheduledAt: daysAgoIso(0, 17, 0),
    durationMinutes: 90,
    status: "confirmed",
    menuName: "背中トリートメント 90 分",
  },
  {
    id: "appt-today-6",
    clientId: "client-watanabe",
    clientName: "渡辺 さくら",
    therapistName: "中村 真奈",
    scheduledAt: daysAgoIso(0, 18, 30),
    durationMinutes: 90,
    status: "confirmed",
    menuName: "背中トリートメント 90 分（初回）",
  },
  // Future appointments — next 7 days.
  {
    id: "appt-future-1",
    clientId: demoClient.id,
    clientName: demoClient.displayName,
    therapistName: "佐藤 美咲",
    scheduledAt: daysAheadIso(7, 15, 0),
    durationMinutes: 90,
    status: "confirmed",
    menuName: "背中トリートメント 90 分（次回予約）",
  },
  {
    id: "appt-future-2",
    clientId: "client-tanaka",
    clientName: "井上 由美",
    therapistName: "高橋 葵",
    scheduledAt: daysAheadIso(3, 13, 0),
    durationMinutes: 90,
    status: "requested",
    menuName: "背中トリートメント 90 分（仮申請）",
  },
  {
    id: "appt-future-3",
    clientId: "client-kimura",
    clientName: "木村 まな",
    therapistName: "佐藤 美咲",
    scheduledAt: daysAheadIso(5, 11, 0),
    durationMinutes: 90,
    status: "confirmed",
    menuName: "背中トリートメント 90 分",
  },
  {
    id: "appt-future-4",
    clientId: "client-watanabe",
    clientName: "渡辺 さくら",
    therapistName: "中村 真奈",
    scheduledAt: daysAheadIso(2, 14, 0),
    durationMinutes: 90,
    status: "confirmed",
    menuName: "背中トリートメント 90 分",
  },
  {
    id: "appt-future-5",
    clientId: "client-takahashi",
    clientName: "高橋 ゆり",
    therapistName: "高橋 葵",
    scheduledAt: daysAheadIso(4, 10, 0),
    durationMinutes: 90,
    status: "confirmed",
    menuName: "背中トリートメント 90 分",
  },
  {
    id: "appt-future-6",
    clientId: "client-suzuki",
    clientName: "鈴木 麻衣",
    therapistName: "佐藤 美咲",
    scheduledAt: daysAheadIso(6, 15, 30),
    durationMinutes: 90,
    status: "confirmed",
    menuName: "背中トリートメント 90 分",
  },
  // Recent past — completed.
  {
    id: "appt-past-1",
    clientId: demoClient.id,
    clientName: demoClient.displayName,
    therapistName: "佐藤 美咲",
    scheduledAt: daysAgoIso(7, 11),
    durationMinutes: 90,
    status: "completed",
    menuName: "背中トリートメント 90 分",
  },
  {
    id: "appt-past-2",
    clientId: "client-tanaka",
    clientName: "井上 由美",
    therapistName: "高橋 葵",
    scheduledAt: daysAgoIso(10, 13),
    durationMinutes: 90,
    status: "completed",
    menuName: "背中トリートメント 90 分",
  },
  {
    id: "appt-past-3",
    clientId: "client-kimura",
    clientName: "木村 まな",
    therapistName: "佐藤 美咲",
    scheduledAt: daysAgoIso(3, 10),
    durationMinutes: 90,
    status: "completed",
    menuName: "背中トリートメント 90 分",
  },
];

export type DemoFeedback = {
  status: FeedbackStatus;
  aiDraft: string;
  approvedText: string | null;
  nutritionistName: string;
  nutritionistLicenseNumber: string;
  approvedAt: string | null;
  salonComment: {
    therapistName: string;
    body: string;
    postedAt: string;
  } | null;
};

export type DemoMealLog = {
  id: string;
  clientId: string;
  loggedAt: string;
  mealType: MealType;
  memo: string;
  photoUrl: string | null;
  feedback: DemoFeedback;
};

const withDisclaimer = (s: string) => `${s.trimEnd()}\n\n— ${DISCLAIMER}`;

const NUTRITIONIST_NAME = "栄養士 木村 沙織";
const NUTRITIONIST_LICENSE = "管理栄養士 第123456号";

export const demoMealLogs: DemoMealLog[] = [
  {
    id: "meal-1",
    clientId: demoClient.id,
    loggedAt: daysAgoIso(0, 8, 30),
    mealType: "breakfast",
    memo: "全粒粉トースト、ゆで卵、ギリシャヨーグルト（無糖）、ブルーベリー、ハーブティー。",
    photoUrl: null,
    feedback: {
      status: "sent",
      aiDraft:
        "タンパク質と食物繊維がバランス良く取れた朝食ですね。発酵食品と季節の果物も組み合わさっており、健康的な習慣作りをサポートする良い選択です。",
      approvedText: withDisclaimer(
        "タンパク質と食物繊維がバランス良く取れた朝食ですね。発酵食品と季節の果物が組み合わさっており、健康的な習慣作りをサポートする良い選択です。一般的な栄養バランスの観点では、午前中の活動エネルギーを支えやすい構成になっています。",
      ),
      nutritionistName: NUTRITIONIST_NAME,
      nutritionistLicenseNumber: NUTRITIONIST_LICENSE,
      approvedAt: hoursAgoIso(1),
      salonComment: {
        therapistName: "佐藤 美咲",
        body: "朝食をしっかり取れている日が増えていますね。施術後の肌コンディションに配慮した習慣として、引き続き続けてみてください。",
        postedAt: minutesAgoIso(20),
      },
    },
  },
  {
    id: "meal-2",
    clientId: demoClient.id,
    loggedAt: daysAgoIso(1, 19, 45),
    mealType: "dinner",
    memo: "鮭の塩焼き、ほうれん草のおひたし、雑穀ごはん（小盛り）、味噌汁（豆腐・わかめ）。",
    photoUrl: null,
    feedback: {
      status: "sent",
      aiDraft:
        "和食中心で塩分とのバランスにも配慮されており、夕食として整った構成です。",
      approvedText: withDisclaimer(
        "和食中心で、青魚由来の良質な脂質と緑黄色野菜が組み合わさっています。一般的な栄養バランスの観点で見ても、夕食として整った構成です。雑穀ごはんは食物繊維の摂取に役立つ習慣ですね。塩分が気になる場合は、味噌汁の出汁を効かせると満足感を保ちやすくなります。",
      ),
      nutritionistName: NUTRITIONIST_NAME,
      nutritionistLicenseNumber: NUTRITIONIST_LICENSE,
      approvedAt: daysAgoIso(1, 22, 30),
      salonComment: {
        therapistName: "佐藤 美咲",
        body: "次回施術前日のお食事として理想的です。肌コンディションに配慮した食習慣として、ぜひ続けてみてください。",
        postedAt: daysAgoIso(1, 23, 0),
      },
    },
  },
  {
    id: "meal-3",
    clientId: demoClient.id,
    loggedAt: daysAgoIso(2, 12, 30),
    mealType: "lunch",
    memo: "コンビニで購入。サラダチキン、海藻サラダ、おにぎり（鮭）、無糖カフェラテ。",
    photoUrl: null,
    feedback: {
      status: "sent",
      aiDraft:
        "外食・コンビニ利用時としては良い選択です。タンパク質をしっかり選んでいて、海藻でミネラルもプラスできています。",
      approvedText: withDisclaimer(
        "コンビニ利用時としては、タンパク質源と海藻類を組み合わせており、忙しい日の選択として工夫されていますね。一般的な栄養バランスの観点で見ると、生野菜を追加できると満足感とビタミン摂取の両方を補いやすくなります。健康的な習慣作りをサポートする選び方です。",
      ),
      nutritionistName: NUTRITIONIST_NAME,
      nutritionistLicenseNumber: NUTRITIONIST_LICENSE,
      approvedAt: daysAgoIso(2, 15, 0),
      salonComment: {
        therapistName: "佐藤 美咲",
        body: "忙しい日でも工夫してくださっていますね。次回ご来店時、おすすめの組み合わせを少しご紹介させてください。",
        postedAt: daysAgoIso(2, 18, 0),
      },
    },
  },
  {
    id: "meal-4",
    clientId: "client-kimura",
    loggedAt: daysAgoIso(0, 13, 0),
    mealType: "lunch",
    memo: "玄米ごはん、鶏胸肉のソテー、温野菜（ブロッコリー・人参）、味噌汁。",
    photoUrl: null,
    feedback: {
      status: "sent",
      aiDraft:
        "野菜・タンパク質・主食のバランスが整った昼食ですね。健康的な習慣作りをサポートする選択です。",
      approvedText: withDisclaimer(
        "野菜・タンパク質・主食のバランスが整った昼食ですね。一般的な栄養バランスの観点では、午後の集中を支えやすい構成です。継続的な習慣として大変良いと思います。",
      ),
      nutritionistName: NUTRITIONIST_NAME,
      nutritionistLicenseNumber: NUTRITIONIST_LICENSE,
      approvedAt: minutesAgoIso(30),
      salonComment: null,
    },
  },
  {
    id: "meal-5",
    clientId: "client-nakamura",
    loggedAt: daysAgoIso(1, 8, 0),
    mealType: "breakfast",
    memo: "オートミール、バナナ、無糖豆乳、ナッツ。",
    photoUrl: null,
    feedback: {
      status: "sent",
      aiDraft:
        "食物繊維と植物性タンパク質を組み合わせた朝食です。健康的な習慣作りをサポートする選択ですね。",
      approvedText: withDisclaimer(
        "食物繊維と植物性タンパク質を組み合わせた朝食ですね。一般的な栄養バランスの観点では、朝の活動エネルギーを支えやすい構成です。",
      ),
      nutritionistName: NUTRITIONIST_NAME,
      nutritionistLicenseNumber: NUTRITIONIST_LICENSE,
      approvedAt: daysAgoIso(1, 11, 0),
      salonComment: {
        therapistName: "佐藤 美咲",
        body: "毎日継続できているのが素晴らしいです。今後もぜひ続けてください。",
        postedAt: daysAgoIso(1, 14, 0),
      },
    },
  },
  {
    id: "meal-6",
    clientId: "client-watanabe",
    loggedAt: hoursAgoIso(3),
    mealType: "lunch",
    memo: "牛丼、味噌汁、お新香。",
    photoUrl: null,
    feedback: {
      status: "awaiting_review",
      aiDraft:
        "忙しい日のランチですね。一般的な栄養バランスの観点では、次回緑黄色野菜やお味噌汁が加わると安心感が増します。健康的な習慣作りをサポートする工夫として、少しずつ取り入れてみてください。",
      approvedText: null,
      nutritionistName: NUTRITIONIST_NAME,
      nutritionistLicenseNumber: NUTRITIONIST_LICENSE,
      approvedAt: null,
      salonComment: null,
    },
  },
];

/** Nutritionist queue: pending drafts awaiting review. */
export type DemoPendingDraft = {
  id: string;
  clientName: string;
  loggedAt: string;
  mealType: MealType;
  memo: string;
  photoUrl: string | null;
  aiDraft: string;
  bannedWordHits: string[];
};

export const demoPendingDrafts: DemoPendingDraft[] = [
  {
    id: "draft-1",
    clientName: "鈴木 麻衣",
    loggedAt: hoursAgoIso(2),
    mealType: "breakfast",
    memo: "オートミール、バナナ、アーモンド少量、豆乳。",
    photoUrl: null,
    aiDraft:
      "食物繊維と植物性タンパク質をバランスよく組み合わせた朝食ですね。一般的な栄養バランスの観点では、朝の活動エネルギーを支える整った構成です。健康的な習慣作りをサポートする選択です。",
    bannedWordHits: [],
  },
  {
    id: "draft-2",
    clientName: "井上 由美",
    loggedAt: hoursAgoIso(4),
    mealType: "lunch",
    memo: "鶏むね肉のグリル、キヌアサラダ、トマトスープ。",
    photoUrl: null,
    aiDraft:
      "高タンパクで野菜量も多い構成で、肌コンディションに配慮した一食ですね。塩分・脂質ともに穏やかで、一般的な栄養バランスの観点では満足度の高い昼食です。",
    bannedWordHits: [],
  },
  {
    id: "draft-3",
    clientName: "加藤 れい",
    loggedAt: daysAgoIso(1, 20, 0),
    mealType: "dinner",
    memo: "牛丼（並・つゆだく）、おしんこ。野菜なし。",
    photoUrl: null,
    aiDraft:
      "忙しい日の夕食ですね。一般的な栄養バランスの観点では、次回緑黄色野菜やお味噌汁を 1 品追加できると安心感が増します。健康的な習慣作りをサポートするちょっとした工夫として、提案させてください。",
    bannedWordHits: [],
  },
];

/** One example draft that has already been approved — shows audit trail. */
export const demoApprovedExample = {
  id: "approved-1",
  clientName: "田中 太郎",
  approvedAt: hoursAgoIso(1),
  approvedBy: NUTRITIONIST_NAME,
  licenseNumber: NUTRITIONIST_LICENSE,
  originalAiDraft: demoMealLogs[0].feedback.aiDraft,
  finalText: demoMealLogs[0].feedback.approvedText ?? "",
};

/** Treatment records / customer chart (§4.3). */
export type DemoTreatmentRecord = {
  id: string;
  clientId: string;
  performedAt: string;
  therapistName: string;
  durationMinutes: number;
  menu: string;
  observations: string;
  homeCareNotes: string;
  hasVideo: boolean;
};

export const demoTreatmentRecords: DemoTreatmentRecord[] = [
  {
    id: "rec-1",
    clientId: demoClient.id,
    performedAt: daysAgoIso(7, 11),
    therapistName: "佐藤 美咲",
    durationMinutes: 90,
    menu: "クレイトリートメント + 保湿パック",
    observations:
      "前回と比較して全体的なコンディションが落ち着いた印象。肩甲骨周りの張りはやや残るため重点的にケア。",
    homeCareNotes:
      "入浴後の保湿ジェルを継続。日中のデスクワーク時、1 時間に 1 度の伸びを推奨。",
    hasVideo: true,
  },
  {
    id: "rec-2",
    clientId: demoClient.id,
    performedAt: daysAgoIso(35, 10),
    therapistName: "佐藤 美咲",
    durationMinutes: 90,
    menu: "ディープクレンジング + マッサージ",
    observations:
      "ホームケアの習慣が定着してきている様子。背中上部の質感に変化が見られる。",
    homeCareNotes: "推奨ボディソープに切替済。週 2 回のスクラブを継続。",
    hasVideo: false,
  },
  {
    id: "rec-3",
    clientId: demoClient.id,
    performedAt: daysAgoIso(63, 11),
    therapistName: "佐藤 美咲",
    durationMinutes: 90,
    menu: "クレイトリートメント",
    observations:
      "初回後 3 週間。乾燥傾向のため保湿ケアを強化。お客様のセルフケアモチベーション高い。",
    homeCareNotes: "保湿ジェル朝晩 2 回。摩擦の少ない衣類を推奨。",
    hasVideo: true,
  },
  {
    id: "rec-4",
    clientId: demoClient.id,
    performedAt: daysAgoIso(84, 10),
    therapistName: "佐藤 美咲",
    durationMinutes: 120,
    menu: "初回カウンセリング + クレイトリートメント",
    observations:
      "敏感肌・乾燥傾向。生活習慣ヒアリング済み（デスクワーク中心、就寝 1:00 前後）。",
    homeCareNotes: "推奨ボディソープと保湿ジェルをお渡し。次回まで継続使用を依頼。",
    hasVideo: false,
  },
  // Kimura — 8 weeks of treatment history.
  {
    id: "rec-k-1",
    clientId: "client-kimura",
    performedAt: daysAgoIso(3, 10),
    therapistName: "佐藤 美咲",
    durationMinutes: 90,
    menu: "クレイトリートメント + 保湿パック",
    observations: "8 週目。肌コンディション安定。",
    homeCareNotes: "現状のケアを継続。",
    hasVideo: false,
  },
  {
    id: "rec-k-2",
    clientId: "client-kimura",
    performedAt: daysAgoIso(28, 10),
    therapistName: "佐藤 美咲",
    durationMinutes: 90,
    menu: "ディープクレンジング",
    observations: "4 週目。改善傾向。",
    homeCareNotes: "保湿の継続を依頼。",
    hasVideo: false,
  },
  {
    id: "rec-k-3",
    clientId: "client-kimura",
    performedAt: daysAgoIso(56, 10),
    therapistName: "佐藤 美咲",
    durationMinutes: 120,
    menu: "初回カウンセリング + クレイトリートメント",
    observations: "初回。乾燥傾向。",
    homeCareNotes: "推奨ボディソープと保湿ジェルをお渡し。",
    hasVideo: false,
  },
];

export type DemoQaThread = {
  id: string;
  clientId: string;
  clientName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export const demoQaThreads: DemoQaThread[] = [
  {
    id: "qa-1",
    clientId: "client-suzuki",
    clientName: "鈴木 麻衣",
    lastMessage: "おすすめのボディソープは継続購入できますか？",
    lastMessageAt: minutesAgoIso(45),
    unreadCount: 1,
  },
  {
    id: "qa-2",
    clientId: "client-kato",
    clientName: "加藤 れい",
    lastMessage: "次回の予約変更をお願いしたいです。",
    lastMessageAt: hoursAgoIso(3),
    unreadCount: 2,
  },
  {
    id: "qa-3",
    clientId: "client-kimura",
    clientName: "木村 まな",
    lastMessage: "ホームケアの頻度について相談したいです。",
    lastMessageAt: hoursAgoIso(12),
    unreadCount: 0,
  },
  {
    id: "qa-4",
    clientId: "client-watanabe",
    clientName: "渡辺 さくら",
    lastMessage: "初回の流れを教えてください。",
    lastMessageAt: daysAgoIso(1, 18, 0),
    unreadCount: 1,
  },
];

export type DemoKpiSnapshot = {
  todayAppointments: number;
  todayAppointmentsDelta: number;
  monthlyNewClients: number;
  monthlyNewClientsDelta: number;
  monthlyCompletionRate: number; // 0-100
  monthlyCompletionRateDelta: number; // pt
  pendingQa: number;
  pendingQaDelta: number;
  monthlyRevenueJpy: number;
  monthlyRevenueVsLastPct: number;
  activeClients: number;
  averageImprovement: number;
  averageImprovementDelta: number;
};

export const demoKpiSnapshot: DemoKpiSnapshot = {
  todayAppointments: 6,
  todayAppointmentsDelta: 1,
  monthlyNewClients: 9,
  monthlyNewClientsDelta: 3,
  monthlyCompletionRate: 78,
  monthlyCompletionRateDelta: 6,
  pendingQa: 2,
  pendingQaDelta: -1,
  monthlyRevenueJpy: 2_120_000,
  monthlyRevenueVsLastPct: 12,
  activeClients: 38,
  averageImprovement: 0.8,
  averageImprovementDelta: 0.2,
};

export type DemoRevenueBreakdown = {
  b2bPlatform: number;
  b2cUpper: number;
  revenueShare: number;
};

export const demoRevenueBreakdown: DemoRevenueBreakdown = {
  b2bPlatform: 980_000,
  b2cUpper: 760_000,
  revenueShare: 380_000,
};

export type DemoTherapistPerformance = {
  name: string;
  activeClients: number;
  monthlyCompletions: number;
  averageRating: number;
  responseHours: number;
};

export const demoTherapistPerformance: DemoTherapistPerformance[] = [
  {
    name: "佐藤 美咲",
    activeClients: 18,
    monthlyCompletions: 3,
    averageRating: 4.8,
    responseHours: 2.1,
  },
  {
    name: "高橋 葵",
    activeClients: 12,
    monthlyCompletions: 2,
    averageRating: 4.6,
    responseHours: 3.4,
  },
  {
    name: "中村 真奈",
    activeClients: 8,
    monthlyCompletions: 1,
    averageRating: 4.7,
    responseHours: 4.0,
  },
];

export type DemoActivityEntry = {
  id: string;
  kind: "photo" | "meal" | "nutritionist_approval" | "appointment" | "qa" | "completion";
  actor: string;
  actorRole?: "customer" | "therapist" | "neutral";
  body: string;
  at: string;
  href?: string;
};

/**
 * Recent salon activity feed — computed at module load so the relative times
 * are always "X 分前" / "X 時間前".
 */
export const demoActivityFeed: DemoActivityEntry[] = [
  {
    id: "act-1",
    kind: "photo",
    actor: "佐藤 美咲",
    actorRole: "therapist",
    body: "田中 太郎 様の進捗写真を撮影",
    at: minutesAgoIso(2),
    href: "/admin/clients/client-yamada",
  },
  {
    id: "act-2",
    kind: "meal",
    actor: "鈴木 麻衣",
    actorRole: "customer",
    body: "食事ログを投稿",
    at: minutesAgoIso(15),
    href: "/admin/clients/client-suzuki",
  },
  {
    id: "act-3",
    kind: "nutritionist_approval",
    actor: "栄養士 木村",
    actorRole: "neutral",
    body: "井上 由美 様の食事フィードバックを承認",
    at: minutesAgoIso(30),
    href: "/admin/clients/client-tanaka",
  },
  {
    id: "act-4",
    kind: "appointment",
    actor: "田中 太郎",
    actorRole: "customer",
    body: "次回予約を確定",
    at: hoursAgoIso(1),
    href: "/admin/clients/client-yamada",
  },
  {
    id: "act-5",
    kind: "qa",
    actor: "加藤 れい",
    actorRole: "customer",
    body: "Q&A メッセージを送信",
    at: hoursAgoIso(3),
    href: "/admin/clients/client-kato",
  },
  {
    id: "act-6",
    kind: "completion",
    actor: "中村 みき",
    actorRole: "customer",
    body: "6 ヶ月コースを完遂",
    at: hoursAgoIso(8),
    href: "/admin/clients/client-nakamura",
  },
  {
    id: "act-7",
    kind: "photo",
    actor: "佐藤 美咲",
    actorRole: "therapist",
    body: "木村 まな 様の進捗写真を撮影",
    at: hoursAgoIso(12),
    href: "/admin/clients/client-kimura",
  },
  {
    id: "act-8",
    kind: "meal",
    actor: "渡辺 さくら",
    actorRole: "customer",
    body: "食事ログを投稿",
    at: daysAgoIso(1, 12, 0),
    href: "/admin/clients/client-watanabe",
  },
];

/** Convenience: formatted JPY. */
export const formatJpy = (n: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n);

// ─────────────────────────────────────────────────────────────────────────────
// Availability engine
//
// Salon hours: 10:00 – 19:00, last slot starts at 18:30 (finishes 19:00).
// Closed on Mondays. Weekend utilization runs higher than weekday utilization.
// Concrete bookings derive from `demoAppointments` and `storedAppointments`
// passed in by the caller; a deterministic pseudo-random fill brings the rest
// of the day up to the target utilization so each day still tells a story.
// ─────────────────────────────────────────────────────────────────────────────

/** Salon opens at 10:00. */
export const SALON_OPEN_HOUR = 10;
/** Salon closes at 19:00 — last slot starts 18:30. */
export const SALON_CLOSE_HOUR = 19;
/** Slot length in minutes. */
export const SLOT_DURATION_MIN = 30;
/** Day-of-week index for 定休日 (Monday). */
export const SALON_CLOSED_WEEKDAY = 1;

export type TimeSlotStatus = "open" | "booked" | "closed" | "past";

export type TimeSlot = {
  /** HH:mm — start time of this 30-minute slot. */
  time: string;
  status: TimeSlotStatus;
  /** When booked, the originating appointment id (if known). */
  appointmentId?: string;
};

export type DayAvailability = {
  /** YYYY-MM-DD */
  date: string;
  /** 0-6 (Sunday = 0). */
  weekday: number;
  isClosed: boolean;
  /** The course-recommended day for the primary user. */
  isRecommended: boolean;
  openSlots: number;
  totalSlots: number;
  slots: TimeSlot[];
};

/** Optional booking that can be folded in (e.g. user's localStorage). */
export type ExternalBooking = {
  scheduledAt: string;
  durationMinutes?: number;
  therapistName?: string;
  appointmentId?: string;
};

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function timeKey(hour: number, minute: number): string {
  return `${pad2(hour)}:${pad2(minute)}`;
}

/** Inclusive list of slot start times (HH:mm) for a single salon day. */
export function buildSlotTimes(): string[] {
  const out: string[] = [];
  for (let h = SALON_OPEN_HOUR; h < SALON_CLOSE_HOUR; h++) {
    out.push(timeKey(h, 0));
    out.push(timeKey(h, 30));
  }
  return out;
}

/** Cheap deterministic hash of a string → [0,1). */
function hashUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Convert to unsigned and divide.
  return ((h >>> 0) % 100000) / 100000;
}

function isWeekend(weekday: number): boolean {
  return weekday === 0 || weekday === 6;
}

type BuildOpts = {
  therapistName?: string;
  /** Bookings already on the books (fixtures + stored). */
  bookings: ExternalBooking[];
  /** "now" — slots earlier than this on the current day are `past`. */
  now: Date;
  /** Per-day target utilization (0..1). */
  targetUtilization: number;
  /** Seed mixed into the deterministic fill so therapists differ. */
  seedScope: string;
};

function buildDayAvailability(d: Date, opts: BuildOpts): DayAvailability {
  const weekday = d.getDay();
  const date = dateKey(d);
  const slotTimes = buildSlotTimes();
  const isClosed = weekday === SALON_CLOSED_WEEKDAY;

  if (isClosed) {
    return {
      date,
      weekday,
      isClosed: true,
      isRecommended: false,
      openSlots: 0,
      totalSlots: slotTimes.length,
      slots: slotTimes.map((t) => ({ time: t, status: "closed" as const })),
    };
  }

  // Map concrete bookings onto slot times for this date.
  const bookedAt = new Map<string, string | undefined>(); // time → appointmentId
  for (const b of opts.bookings) {
    const dt = new Date(b.scheduledAt);
    if (dateKey(dt) !== date) continue;
    if (opts.therapistName && b.therapistName && b.therapistName !== opts.therapistName)
      continue;
    const duration = b.durationMinutes ?? 90;
    // Mark each 30-min slot covered by the appointment.
    const startMin = dt.getHours() * 60 + dt.getMinutes();
    const blocks = Math.max(1, Math.ceil(duration / SLOT_DURATION_MIN));
    for (let i = 0; i < blocks; i++) {
      const mins = startMin + i * SLOT_DURATION_MIN;
      if (mins >= SALON_CLOSE_HOUR * 60) break;
      const t = timeKey(Math.floor(mins / 60), mins % 60);
      if (!bookedAt.has(t)) bookedAt.set(t, b.appointmentId);
    }
  }

  // Deterministically "fill" the day to its target utilization.
  // Slot is booked if (real booking) OR (pseudo-fill is below threshold).
  const slots: TimeSlot[] = slotTimes.map((t) => {
    // Past slots (today only).
    const [hh, mm] = t.split(":").map(Number);
    const slotMoment = new Date(d);
    slotMoment.setHours(hh, mm, 0, 0);
    if (slotMoment.getTime() <= opts.now.getTime()) {
      return { time: t, status: "past" as const };
    }
    const realApptId = bookedAt.get(t);
    if (realApptId !== undefined) {
      return { time: t, status: "booked" as const, appointmentId: realApptId };
    }
    // Pseudo-fill — keeps the booked rate roughly at target utilization.
    const noise = hashUnit(`${opts.seedScope}|${date}|${t}`);
    if (noise < opts.targetUtilization) {
      return { time: t, status: "booked" as const };
    }
    return { time: t, status: "open" as const };
  });

  const openSlots = slots.filter((s) => s.status === "open").length;
  return {
    date,
    weekday,
    isClosed: false,
    isRecommended: false,
    openSlots,
    totalSlots: slots.length,
    slots,
  };
}

export type GetAvailabilityArgs = {
  /** Optional therapist filter (matches against `therapistName`). */
  therapistName?: string;
  daysAhead?: number;
  from?: Date;
  /** Additional bookings beyond the fixture set — e.g. local-storage rows. */
  extraBookings?: ExternalBooking[];
  /** When present, this date gets `isRecommended: true` if open. */
  recommendedDate?: string;
};

function pickRecommendedDate(days: DayAvailability[], explicit?: string): string | null {
  if (explicit) {
    const hit = days.find((d) => d.date === explicit && !d.isClosed);
    if (hit) return hit.date;
  }
  // Choose the first non-closed, sufficiently-open day in the 7–21 day window.
  const eligible = days.slice(7, 22).filter((d) => !d.isClosed && d.openSlots >= 2);
  if (eligible.length > 0) return eligible[0].date;
  // Fall back to any future non-closed day with at least one open slot.
  const fallback = days.find((d) => !d.isClosed && d.openSlots > 0);
  return fallback ? fallback.date : null;
}

/**
 * Build a 14-day (default) availability schedule for one therapist or for the
 * whole salon (when no `therapistName` is given the schedule reflects the
 * therapist's own load — for true salon-wide aggregation use
 * `getAvailabilityForSalon`).
 */
export function getAvailability(args: GetAvailabilityArgs = {}): DayAvailability[] {
  const {
    therapistName,
    daysAhead = 14,
    from = new Date(),
    extraBookings = [],
    recommendedDate,
  } = args;

  const bookings: ExternalBooking[] = [
    ...demoAppointments.map((a) => ({
      scheduledAt: a.scheduledAt,
      durationMinutes: a.durationMinutes,
      therapistName: a.therapistName,
      appointmentId: a.id,
    })),
    ...extraBookings,
  ];

  const start = new Date(from);
  start.setHours(0, 0, 0, 0);

  const days: DayAvailability[] = [];
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const weekday = d.getDay();
    const utilization = isWeekend(weekday) ? 0.9 : 0.7;
    const seedScope = therapistName ?? "salon";
    days.push(
      buildDayAvailability(d, {
        therapistName,
        bookings,
        now: from,
        targetUtilization: utilization,
        seedScope,
      }),
    );
  }

  const reco = pickRecommendedDate(days, recommendedDate);
  if (reco) {
    for (const day of days) {
      if (day.date === reco) day.isRecommended = true;
    }
  }
  return days;
}

/**
 * Salon-wide availability — a slot is open when *any* therapist is free.
 * Useful for admin views that don't want to commit to a single therapist yet.
 */
export function getAvailabilityForSalon(
  args: Omit<GetAvailabilityArgs, "therapistName"> = {},
): DayAvailability[] {
  const perTherapist = demoTherapists.map((t) =>
    getAvailability({ ...args, therapistName: t.name }),
  );
  if (perTherapist.length === 0) {
    return getAvailability(args);
  }
  const dayCount = perTherapist[0].length;
  const merged: DayAvailability[] = [];
  for (let i = 0; i < dayCount; i++) {
    const sample = perTherapist[0][i];
    if (sample.isClosed) {
      merged.push({ ...sample, isRecommended: false });
      continue;
    }
    const slotTimes = buildSlotTimes();
    const slots: TimeSlot[] = slotTimes.map((t) => {
      const all = perTherapist.map((days) => days[i].slots.find((s) => s.time === t));
      // 'past' wins (we don't show past slots as bookable for any therapist).
      if (all.every((s) => s?.status === "past")) return { time: t, status: "past" };
      const anyOpen = all.some((s) => s?.status === "open");
      if (anyOpen) return { time: t, status: "open" };
      return { time: t, status: "booked" };
    });
    merged.push({
      ...sample,
      slots,
      openSlots: slots.filter((s) => s.status === "open").length,
      isRecommended: false,
    });
  }
  // Apply recommended date in aggregate as well.
  const reco = pickRecommendedDate(merged, args.recommendedDate);
  if (reco) {
    for (const day of merged) {
      if (day.date === reco) day.isRecommended = true;
    }
  }
  return merged;
}
