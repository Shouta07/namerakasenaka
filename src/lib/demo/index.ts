import { isDemoModeResolved } from "@/lib/app-mode";

/**
 * デモかどうか。
 *
 * 判定の本体は lib/app-mode.ts に移した。
 * 以前はここで「Supabase の環境変数が無ければデモ」と推測していたが、
 * 環境変数を1つ設定し忘れただけで本番が認証なしで公開されてしまう。
 * いまは NEXT_PUBLIC_APP_MODE の宣言が優先で、
 * production と宣言して土台が欠けているときは開かずに落ちる。
 */
export function isDemoMode(): boolean {
  return isDemoModeResolved();
}

export const demoOrganization = {
  id: "demo-org",
  name: "デモサロン（架空）",
  plan: "starter",
};

export const demoClient = {
  id: "demo-client",
  display_name: "田中 太郎",
  skin_type: "敏感肌",
  primary_therapist_name: "佐藤 美咲",
  course_name: "背中ケア6ヶ月コース",
  started_at: "2026-02-14",
};

export const demoProgressPhotos = [
  { id: "p1", taken_at: "2026-02-14", caption: "施術前（初回）", photo_type: "before" },
  { id: "p2", taken_at: "2026-03-01", caption: "2回目施術後", photo_type: "after" },
  { id: "p3", taken_at: "2026-03-15", caption: "3回目施術後", photo_type: "after" },
  { id: "p4", taken_at: "2026-04-12", caption: "5回目施術後", photo_type: "after" },
];

export const demoUpcomingAppointment = {
  id: "a1",
  scheduled_at: "2026-05-22T14:00:00+09:00",
  therapist_name: "佐藤 美咲",
};

export const demoKpis = {
  todayAppointments: 6,
  monthlyNewClients: 9,
  monthlyCompletions: 4,
  pendingQa: 2,
};
