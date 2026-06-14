export function isDemoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export const demoOrganization = {
  id: "demo-org",
  name: "デモサロン（架空）",
  plan: "starter",
};

export const demoClient = {
  id: "demo-client",
  display_name: "田村 洋子",
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
