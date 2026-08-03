export const dynamic = "force-dynamic";

import { MobileBottomNav, RoleNav, type NavItem } from "@/components/ui/nav";
import { DemoBanner } from "@/components/demo-banner";
import { RoleTopBar } from "@/components/ui/role-top-bar";
import { PresentationModeToggle } from "@/components/presentation-mode";
import { demoOrganization } from "@/lib/demo/fixtures";

/**
 * 価値検証の最小構成。
 *
 * 画面は残してあるが、ナビからは外している。
 * 見えない画面は使われず、使われない画面はサポート原価を生まない。
 * 何を外し、なぜ外し、いつ戻すかは lib/field-cx/mvp.ts。
 */
const sidebarItems: NavItem[] = [
  { href: "/admin/customers", label: "検査と伴走", icon: "sparkles" },
  { href: "/admin/clients", label: "顧客", icon: "users" },
  { href: "/admin/invites/new", label: "招待", icon: "mail" },
  { href: "/admin/settings/line", label: "公式LINE連携", icon: "message-circle" },
];

// 現場は指1本で回す。迷う余地を作らない。
const mobileItems: NavItem[] = [
  { href: "/admin/customers", label: "検査", icon: "sparkles" },
  { href: "/admin/clients", label: "顧客", icon: "users" },
  { href: "/admin/invites/new", label: "招待", icon: "mail" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <RoleNav title="SalonAdmin" items={sidebarItems} />
      <div className="flex min-w-0 flex-1 flex-col">
        <RoleTopBar
          role="経営者"
          persona="salon"
          eyebrow={demoOrganization.name}
          right={<PresentationModeToggle />}
        />
        <main className="min-w-0 flex-1 px-4 pt-4 pb-[calc(72px+max(var(--safe-bottom),12px))] md:px-8 md:pb-8">
          {children}
        </main>
      </div>
      <MobileBottomNav items={mobileItems} />
      <DemoBanner />
    </div>
  );
}
