export const dynamic = "force-dynamic";

import { MobileBottomNav, RoleNav, type NavItem } from "@/components/ui/nav";
import { DemoBanner } from "@/components/demo-banner";

const items: NavItem[] = [
  { href: "/n/queue", label: "監修キュー", icon: "list-checks" },
];

export default function NutritionistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <RoleNav title="Nutritionist" items={items} />
      <main className="flex-1 px-4 pt-6 pb-[calc(72px+max(var(--safe-bottom),12px))] md:px-8 md:pb-8">
        {children}
      </main>
      <MobileBottomNav items={items} />
      <DemoBanner />
    </div>
  );
}
