export const dynamic = "force-dynamic";

import { MobileNav, RoleNav, type NavItem } from "@/components/ui/nav";
import { DemoBanner } from "@/components/demo-banner";

const items: NavItem[] = [
  { href: "/t/today", label: "本日" },
  { href: "/t/calendar", label: "カレンダー" },
  { href: "/t/clients", label: "担当顧客" },
  { href: "/t/qa", label: "Q&A" },
];

export default function TherapistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <RoleNav title="Therapist" items={items} />
      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      <MobileNav items={items} />
      <DemoBanner />
    </div>
  );
}
