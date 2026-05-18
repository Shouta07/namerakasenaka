export const dynamic = "force-dynamic";

import {
  CalendarDays,
  Camera,
  MessageCircle,
  Salad,
  Sparkles,
} from "lucide-react";
import { MobileBottomNav, RoleNav, type NavItem } from "@/components/ui/nav";
import { DemoBanner } from "@/components/demo-banner";

// 5 items max for the bottom nav on iPhone.
const items: NavItem[] = [
  { href: "/c/progress", label: "進捗", icon: Camera },
  { href: "/c/meals", label: "食事", icon: Salad },
  { href: "/c/calendar", label: "予約", icon: CalendarDays },
  { href: "/c/qa", label: "Q&A", icon: MessageCircle },
  { href: "/c/self-log", label: "セルフ", icon: Sparkles },
];

// Sidebar (md+) keeps a richer item set — appointments listing stays
// reachable without crowding the mobile bar.
const sidebarItems: NavItem[] = [
  { href: "/c/progress", label: "進捗", icon: Camera },
  { href: "/c/meals", label: "食事", icon: Salad },
  { href: "/c/calendar", label: "カレンダー", icon: CalendarDays },
  { href: "/c/appointments", label: "予約一覧", icon: CalendarDays },
  { href: "/c/qa", label: "Q&A", icon: MessageCircle },
  { href: "/c/self-log", label: "セルフログ", icon: Sparkles },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <RoleNav title="Client" items={sidebarItems} />
      <main className="flex-1 px-4 pt-6 pb-[calc(72px+max(var(--safe-bottom),12px))] md:px-8 md:pb-8">
        {children}
      </main>
      <MobileBottomNav items={items} />
      <DemoBanner />
    </div>
  );
}
