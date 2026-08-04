export const dynamic = "force-dynamic";

import { MobileBottomNav, RoleNav, type NavItem } from "@/components/ui/nav";
import { DemoBanner } from "@/components/demo-banner";
import { TrialBanner } from "@/components/trial/trial-banner";
import { RoleTopBar } from "@/components/ui/role-top-bar";
import { PresentationModeToggle } from "@/components/presentation-mode";
import { demoOrganization } from "@/lib/demo/fixtures";

const items: NavItem[] = [
  { href: "/t/today", label: "本日", icon: "stethoscope" },
  { href: "/t/clients", label: "担当", icon: "users" },
  { href: "/t/calendar", label: "予定", icon: "calendar-days" },
];

/** 価値検証の最小構成。外したものと理由は lib/vitality-design/mvp.ts。 */
const sidebarItems: NavItem[] = [
  { href: "/t/today", label: "本日", icon: "stethoscope" },
  { href: "/t/clients", label: "担当顧客", icon: "users" },
  { href: "/t/calendar", label: "カレンダー", icon: "calendar-days" },
];

export default function TherapistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <RoleNav title="Therapist" items={sidebarItems} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TrialBanner />
        <RoleTopBar
          role="セラピスト"
          persona="therapist"
          eyebrow={demoOrganization.name}
          right={<PresentationModeToggle />}
        />
        <main className="min-w-0 flex-1 px-4 pt-4 pb-[calc(72px+max(var(--safe-bottom),12px))] md:px-8 md:pb-8">
          {children}
        </main>
      </div>
      <MobileBottomNav items={items} />
      <DemoBanner />
    </div>
  );
}
