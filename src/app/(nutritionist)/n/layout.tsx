export const dynamic = "force-dynamic";

import { MobileNav, RoleNav, type NavItem } from "@/components/ui/nav";

const items: NavItem[] = [{ href: "/n/queue", label: "監修キュー" }];

export default function NutritionistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <RoleNav title="Nutritionist" items={items} />
      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      <MobileNav items={items} />
    </div>
  );
}
