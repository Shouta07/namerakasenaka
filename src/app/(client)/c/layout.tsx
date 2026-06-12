export const dynamic = "force-dynamic";

import { MobileBottomNav, RoleNav, type NavItem } from "@/components/ui/nav";
import { DemoBanner } from "@/components/demo-banner";
import { RoleTopBar } from "@/components/ui/role-top-bar";
import { demoOrganization } from "@/lib/demo/fixtures";

// 5 items max for the bottom nav on iPhone.
const items: NavItem[] = [
  { href: "/c/progress", label: "進捗", icon: "camera" },
  { href: "/c/meals", label: "食事", icon: "salad" },
  { href: "/c/calendar", label: "予約", icon: "calendar-days" },
  { href: "/c/qa", label: "Q&A", icon: "message-circle" },
  // セルフログはサイドバー + /c/guide 内のリンクから引き続き到達できる。
  { href: "/c/guide", label: "ガイド", icon: "sparkles" },
];

// Sidebar (md+) keeps a richer item set — appointments listing stays
// reachable without crowding the mobile bar.
const sidebarItems: NavItem[] = [
  { href: "/c/progress", label: "進捗", icon: "camera" },
  { href: "/c/meals", label: "食事", icon: "salad" },
  { href: "/c/calendar", label: "カレンダー", icon: "calendar-days" },
  { href: "/c/appointments", label: "予約一覧", icon: "calendar-days" },
  { href: "/c/qa", label: "Q&A", icon: "message-circle" },
  { href: "/c/guide", label: "回復ガイド", icon: "sparkles" },
  { href: "/c/self-log", label: "セルフログ", icon: "sparkles" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <RoleNav title="Client" items={sidebarItems} />
      <div className="flex flex-1 flex-col">
        <RoleTopBar role="顧客" persona="client" eyebrow={demoOrganization.name} />
        <main className="flex-1 px-4 pt-4 pb-[calc(72px+max(var(--safe-bottom),12px))] md:px-8 md:pb-8">
          {children}
        </main>
      </div>
      <MobileBottomNav items={items} />
      <DemoBanner />
    </div>
  );
}
