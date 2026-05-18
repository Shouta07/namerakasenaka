/**
 * Self-contained demo fixtures for the /demo tour.
 *
 * Goals:
 * - No Supabase calls.
 * - Realistic Japanese phrasing that complies with §8.2 banned-word list.
 * - Each AI / nutritionist feedback ends with the §4.4.4 disclaimer.
 * - Stable picsum.photos seeds so images render deterministically.
 */

import {
  type AppointmentStatus,
  type FeedbackStatus,
  type MealType,
  type PhotoType,
} from "@/types/domain";
import { DISCLAIMER } from "@/lib/compliance/banned-words";

const PICSUM = (seed: string, w = 600, h = 800) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export type DemoOrganization = {
  id: string;
  name: string;
  planName: string;
  billingMode: "B2B_ONLY" | "B2C_ONLY" | "DUAL";
};

export const demoOrganization: DemoOrganization = {
  id: "org-carat-demo",
  name: "carat なめらかせなか 表参道店",
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
  avatarUrl: string;
};

export const demoClient: DemoClient = {
  id: "client-yamada",
  displayName: "山田 花子",
  furigana: "やまだ はなこ",
  ageRange: "30代",
  skinType: "敏感肌・乾燥傾向",
  courseName: "背中ケア 6 ヶ月コース",
  primaryTherapistName: "佐藤 美咲",
  startedOn: "2026-02-14",
  sessionsCompleted: 3,
  sessionsTotal: 6,
  avatarUrl: PICSUM("yamada-avatar", 200, 200),
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
    startedOn: "2026-03-02",
    sessionsCompleted: 2,
    sessionsTotal: 3,
    avatarUrl: PICSUM("suzuki-avatar", 200, 200),
  },
  {
    id: "client-tanaka",
    displayName: "田中 由美",
    furigana: "たなか ゆみ",
    ageRange: "20代",
    skinType: "脂性肌",
    courseName: "背中ケア 6 ヶ月コース",
    primaryTherapistName: "高橋 葵",
    startedOn: "2026-01-20",
    sessionsCompleted: 5,
    sessionsTotal: 6,
    avatarUrl: PICSUM("tanaka-avatar", 200, 200),
  },
  {
    id: "client-kato",
    displayName: "加藤 れい",
    furigana: "かとう れい",
    ageRange: "30代",
    skinType: "敏感肌",
    courseName: "背中ケア 6 ヶ月コース",
    primaryTherapistName: "佐藤 美咲",
    startedOn: "2026-02-28",
    sessionsCompleted: 2,
    sessionsTotal: 6,
    avatarUrl: PICSUM("kato-avatar", 200, 200),
  },
];

export type DemoProgressPhoto = {
  id: string;
  clientId: string;
  takenAt: string; // ISO
  photoType: PhotoType;
  caption: string;
  selfRating: number | null;
  signedUrl: string;
};

export const demoProgressPhotos: DemoProgressPhoto[] = [
  {
    id: "photo-w1",
    clientId: demoClient.id,
    takenAt: "2026-02-14T10:00:00+09:00",
    photoType: "before",
    caption: "初回カウンセリング時。背中の状態を記録。",
    selfRating: 2,
    signedUrl: PICSUM("yamada-week-1"),
  },
  {
    id: "photo-w2",
    clientId: demoClient.id,
    takenAt: "2026-03-07T11:00:00+09:00",
    photoType: "after",
    caption: "2 回目施術後。トリートメント直後の状態。",
    selfRating: 3,
    signedUrl: PICSUM("yamada-week-2"),
  },
  {
    id: "photo-w3",
    clientId: demoClient.id,
    takenAt: "2026-04-04T10:30:00+09:00",
    photoType: "after",
    caption: "4 回目施術後。日常のホームケアを継続中。",
    selfRating: 4,
    signedUrl: PICSUM("yamada-week-3"),
  },
  {
    id: "photo-w4",
    clientId: demoClient.id,
    takenAt: "2026-05-09T11:00:00+09:00",
    photoType: "after",
    caption: "5 回目施術後。コンディションが落ち着いてきた感覚あり。",
    selfRating: 5,
    signedUrl: PICSUM("yamada-week-4"),
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

export const demoAppointments: DemoAppointment[] = [
  {
    id: "appt-1",
    clientId: "client-tanaka",
    clientName: "田中 由美",
    therapistName: "高橋 葵",
    scheduledAt: "2026-05-18T10:00:00+09:00",
    durationMinutes: 90,
    status: "completed",
    menuName: "背中トリートメント 90 分",
  },
  {
    id: "appt-2",
    clientId: "client-suzuki",
    clientName: "鈴木 麻衣",
    therapistName: "佐藤 美咲",
    scheduledAt: "2026-05-18T12:00:00+09:00",
    durationMinutes: 90,
    status: "completed",
    menuName: "背中トリートメント 90 分",
  },
  {
    id: "appt-3",
    clientId: demoClient.id,
    clientName: demoClient.displayName,
    therapistName: "佐藤 美咲",
    scheduledAt: "2026-05-18T15:00:00+09:00",
    durationMinutes: 90,
    status: "confirmed",
    menuName: "背中トリートメント 90 分",
  },
  {
    id: "appt-4",
    clientId: "client-kato",
    clientName: "加藤 れい",
    therapistName: "佐藤 美咲",
    scheduledAt: "2026-05-18T17:00:00+09:00",
    durationMinutes: 90,
    status: "confirmed",
    menuName: "背中トリートメント 90 分",
  },
  {
    id: "appt-5",
    clientId: demoClient.id,
    clientName: demoClient.displayName,
    therapistName: "佐藤 美咲",
    scheduledAt: "2026-06-01T15:00:00+09:00",
    durationMinutes: 90,
    status: "confirmed",
    menuName: "背中トリートメント 90 分（次回予約）",
  },
  {
    id: "appt-6",
    clientId: "client-tanaka",
    clientName: "田中 由美",
    therapistName: "高橋 葵",
    scheduledAt: "2026-05-25T13:00:00+09:00",
    durationMinutes: 90,
    status: "requested",
    menuName: "背中トリートメント 90 分（仮申請）",
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
  photoUrl: string;
  feedback: DemoFeedback;
};

const withDisclaimer = (s: string) => `${s.trimEnd()}\n\n— ${DISCLAIMER}`;

export const demoMealLogs: DemoMealLog[] = [
  {
    id: "meal-1",
    clientId: demoClient.id,
    loggedAt: "2026-05-15T08:30:00+09:00",
    mealType: "breakfast",
    memo: "全粒粉トースト、ゆで卵、ギリシャヨーグルト（無糖）、ブルーベリー、ハーブティー。",
    photoUrl: PICSUM("meal-breakfast", 700, 500),
    feedback: {
      status: "sent",
      aiDraft:
        "タンパク質と食物繊維がバランス良く取れた朝食ですね。発酵食品と季節の果物も組み合わさっており、健康的な習慣作りをサポートする良い選択です。",
      approvedText: withDisclaimer(
        "タンパク質と食物繊維がバランス良く取れた朝食ですね。発酵食品と季節の果物が組み合わさっており、健康的な習慣作りをサポートする良い選択です。一般的な栄養バランスの観点では、午前中の活動エネルギーを支えやすい構成になっています。",
      ),
      nutritionistName: "栄養士 木村 沙織",
      nutritionistLicenseNumber: "管理栄養士 第123456号",
      approvedAt: "2026-05-15T11:00:00+09:00",
      salonComment: {
        therapistName: "佐藤 美咲",
        body: "朝食をしっかり取れている日が増えていますね。施術後の肌コンディションに配慮した習慣として、引き続き続けてみてください。",
        postedAt: "2026-05-15T14:00:00+09:00",
      },
    },
  },
  {
    id: "meal-2",
    clientId: demoClient.id,
    loggedAt: "2026-05-14T19:45:00+09:00",
    mealType: "dinner",
    memo: "鮭の塩焼き、ほうれん草のおひたし、雑穀ごはん（小盛り）、味噌汁（豆腐・わかめ）。",
    photoUrl: PICSUM("meal-dinner", 700, 500),
    feedback: {
      status: "sent",
      aiDraft:
        "和食中心で塩分とのバランスにも配慮されており、夕食として整った構成です。",
      approvedText: withDisclaimer(
        "和食中心で、青魚由来の良質な脂質と緑黄色野菜が組み合わさっています。一般的な栄養バランスの観点で見ても、夕食として整った構成です。雑穀ごはんは食物繊維の摂取に役立つ習慣ですね。塩分が気になる場合は、味噌汁の出汁を効かせると満足感を保ちやすくなります。",
      ),
      nutritionistName: "栄養士 木村 沙織",
      nutritionistLicenseNumber: "管理栄養士 第123456号",
      approvedAt: "2026-05-14T22:30:00+09:00",
      salonComment: {
        therapistName: "佐藤 美咲",
        body: "次回施術前日のお食事として理想的です。肌コンディションに配慮した食習慣として、ぜひ続けてみてください。",
        postedAt: "2026-05-15T09:00:00+09:00",
      },
    },
  },
  {
    id: "meal-3",
    clientId: demoClient.id,
    loggedAt: "2026-05-13T12:30:00+09:00",
    mealType: "lunch",
    memo: "コンビニで購入。サラダチキン、海藻サラダ、おにぎり（鮭）、無糖カフェラテ。",
    photoUrl: PICSUM("meal-lunch", 700, 500),
    feedback: {
      status: "sent",
      aiDraft:
        "外食・コンビニ利用時としては良い選択です。タンパク質をしっかり選んでいて、海藻でミネラルもプラスできています。",
      approvedText: withDisclaimer(
        "コンビニ利用時としては、タンパク質源と海藻類を組み合わせており、忙しい日の選択として工夫されていますね。一般的な栄養バランスの観点で見ると、生野菜を追加できると満足感とビタミン摂取の両方を補いやすくなります。健康的な習慣作りをサポートする選び方です。",
      ),
      nutritionistName: "栄養士 木村 沙織",
      nutritionistLicenseNumber: "管理栄養士 第123456号",
      approvedAt: "2026-05-13T15:00:00+09:00",
      salonComment: {
        therapistName: "佐藤 美咲",
        body: "忙しい日でも工夫してくださっていますね。次回ご来店時、おすすめの組み合わせを少しご紹介させてください。",
        postedAt: "2026-05-13T18:00:00+09:00",
      },
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
  photoUrl: string;
  aiDraft: string;
  bannedWordHits: string[];
};

export const demoPendingDrafts: DemoPendingDraft[] = [
  {
    id: "draft-1",
    clientName: "鈴木 麻衣",
    loggedAt: "2026-05-17T07:45:00+09:00",
    mealType: "breakfast",
    memo: "オートミール、バナナ、アーモンド少量、豆乳。",
    photoUrl: PICSUM("draft-oats", 700, 500),
    aiDraft:
      "食物繊維と植物性タンパク質をバランスよく組み合わせた朝食ですね。一般的な栄養バランスの観点では、朝の活動エネルギーを支える整った構成です。健康的な習慣作りをサポートする選択です。",
    bannedWordHits: [],
  },
  {
    id: "draft-2",
    clientName: "田中 由美",
    loggedAt: "2026-05-17T13:10:00+09:00",
    mealType: "lunch",
    memo: "鶏むね肉のグリル、キヌアサラダ、トマトスープ。",
    photoUrl: PICSUM("draft-grill", 700, 500),
    aiDraft:
      "高タンパクで野菜量も多い構成で、肌コンディションに配慮した一食ですね。塩分・脂質ともに穏やかで、一般的な栄養バランスの観点では満足度の高い昼食です。",
    bannedWordHits: [],
  },
  {
    id: "draft-3",
    clientName: "加藤 れい",
    loggedAt: "2026-05-17T20:00:00+09:00",
    mealType: "dinner",
    memo: "牛丼（並・つゆだく）、おしんこ。野菜なし。",
    photoUrl: PICSUM("draft-gyudon", 700, 500),
    aiDraft:
      "忙しい日の夕食ですね。一般的な栄養バランスの観点では、次回緑黄色野菜やお味噌汁を 1 品追加できると安心感が増します。健康的な習慣作りをサポートするちょっとした工夫として、提案させてください。",
    bannedWordHits: [],
  },
];

/** One example draft that has already been approved — shows audit trail. */
export const demoApprovedExample = {
  id: "approved-1",
  clientName: "山田 花子",
  approvedAt: "2026-05-15T11:00:00+09:00",
  approvedBy: "栄養士 木村 沙織",
  licenseNumber: "管理栄養士 第123456号",
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
    performedAt: "2026-05-09T11:00:00+09:00",
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
    performedAt: "2026-04-04T10:30:00+09:00",
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
    performedAt: "2026-03-07T11:00:00+09:00",
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
    performedAt: "2026-02-14T10:00:00+09:00",
    therapistName: "佐藤 美咲",
    durationMinutes: 120,
    menu: "初回カウンセリング + クレイトリートメント",
    observations:
      "敏感肌・乾燥傾向。生活習慣ヒアリング済み（デスクワーク中心、就寝 1:00 前後）。",
    homeCareNotes: "推奨ボディソープと保湿ジェルをお渡し。次回まで継続使用を依頼。",
    hasVideo: false,
  },
];

export type DemoQaThread = {
  id: string;
  clientName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export const demoQaThreads: DemoQaThread[] = [
  {
    id: "qa-1",
    clientName: "鈴木 麻衣",
    lastMessage: "おすすめのボディソープは継続購入できますか？",
    lastMessageAt: "2026-05-18T09:12:00+09:00",
    unreadCount: 1,
  },
  {
    id: "qa-2",
    clientName: "加藤 れい",
    lastMessage: "次回の予約変更をお願いしたいです。",
    lastMessageAt: "2026-05-17T21:34:00+09:00",
    unreadCount: 2,
  },
];

export type DemoKpiSnapshot = {
  todayAppointments: number;
  monthlyNewClients: number;
  monthlyCompletionRate: number; // 0-100
  pendingQa: number;
  monthlyRevenueJpy: number;
  activeClients: number;
};

export const demoKpiSnapshot: DemoKpiSnapshot = {
  todayAppointments: 4,
  monthlyNewClients: 7,
  monthlyCompletionRate: 92,
  pendingQa: 2,
  monthlyRevenueJpy: 1_840_000,
  activeClients: 38,
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

/** Convenience: formatted JPY. */
export const formatJpy = (n: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n);
