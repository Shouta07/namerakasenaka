export const dynamic = "force-dynamic";

import { MobileBottomNav, RoleNav, type NavItem } from "@/components/ui/nav";
import { DemoBanner } from "@/components/demo-banner";

const items: NavItem[] = [
  { href: "/t/today", label: "本日", icon: "stethoscope" },
  { href: "/t/clients", label: "担当", icon: "users" },
  { href: "/t/calendar", label: "予定", icon: "calendar-days" },
  { href: "/t/qa", label: "Q&A", icon: "message-circle" },
];

const sidebarItems: NavItem[] = [
  { href: "/t/today", label: "本日", icon: "stethoscope" },
  { href: "/t/clients", label: "担当顧客", icon: "users" },
  { href: "/t/calendar", label: "カレンダー", icon: "calendar-days" },
  { href: "/t/qa", label: "Q&A", icon: "message-circle" },
  { href: "/t/clients", label: "カルテ", icon: "clipboard-list" },
];

export default function TherapistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <RoleNav title="Therapist" items={sidebarItems} />
      <main className="flex-1 px-4 pt-6 pb-[calc(72px+max(var(--safe-bottom),12px))] md:px-8 md:pb-8">
        {children}
      </main>
      <MobileBottomNav items={items} />
      <DemoBanner />
    </div>
  );
}
