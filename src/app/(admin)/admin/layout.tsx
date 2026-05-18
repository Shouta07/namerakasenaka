export const dynamic = "force-dynamic";

import { MobileNav, RoleNav, type NavItem } from "@/components/ui/nav";

const items: NavItem[] = [
  { href: "/admin/dashboard", label: "ダッシュボード" },
  { href: "/admin/calendar", label: "カレンダー" },
  { href: "/admin/clients", label: "顧客" },
  { href: "/admin/staff", label: "スタッフ" },
  { href: "/admin/invites/new", label: "招待" },
  { href: "/admin/billing", label: "請求" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <RoleNav title="SalonAdmin" items={items} />
      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      <MobileNav items={items} />
    </div>
  );
}
