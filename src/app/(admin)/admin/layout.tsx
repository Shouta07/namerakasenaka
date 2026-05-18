export const dynamic = "force-dynamic";

import { MobileBottomNav, RoleNav, type NavItem } from "@/components/ui/nav";
import { DemoBanner } from "@/components/demo-banner";
import { RoleTopBar } from "@/components/ui/role-top-bar";
import { demoOrganization } from "@/lib/demo/fixtures";

const items: NavItem[] = [
  { href: "/admin/dashboard", label: "概況", icon: "layout-dashboard" },
  { href: "/admin/clients", label: "顧客", icon: "users" },
  { href: "/admin/staff", label: "スタッフ", icon: "user-round-cog" },
  { href: "/admin/invites/new", label: "招待", icon: "mail" },
  { href: "/admin/billing", label: "課金", icon: "credit-card" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <RoleNav title="SalonAdmin" items={items} />
      <div className="flex flex-1 flex-col">
        <RoleTopBar role="経営者" persona="salon" eyebrow={demoOrganization.name} />
        <main className="flex-1 px-4 pt-4 pb-[calc(72px+max(var(--safe-bottom),12px))] md:px-8 md:pb-8">
          {children}
        </main>
      </div>
      <MobileBottomNav items={items} />
      <DemoBanner />
    </div>
  );
}
