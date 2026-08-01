export const dynamic = "force-dynamic";

import { MobileBottomNav, type NavItem } from "@/components/ui/nav";
import { DemoBanner } from "@/components/demo-banner";
import { RoleTopBar } from "@/components/ui/role-top-bar";
import { demoOrganization } from "@/lib/demo/fixtures";

/**
 * お客様の画面は、スマホ（iPhone / Android）だけを想定する。
 *
 * やりとりは LINE で行うため、アプリの中に相談窓口は持たない。
 *
 * PCで開くことは想定しない。だからサイドバーは持たず、幅は端末サイズで止め、
 * 操作は下のバーと親指の届く範囲だけで完結させる。
 * 大きい画面では、端末の形のまま中央に置く（PC用に間延びさせない）。
 *
 * タブは2つ。お客様に「記録する場所」を持たせない —
 * 記録はサロンがやり、お客様は受け取るだけでいい。
 */
const items: NavItem[] = [
  { href: "/c/progress", label: "今日", icon: "sparkles" },
  { href: "/c/guide", label: "からだ", icon: "camera" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-stone-100">
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-[#fafaf7] shadow-sm">
        <RoleTopBar role="顧客" persona="client" eyebrow={demoOrganization.name} />
        <main className="flex-1 px-4 pt-4 pb-[calc(76px+max(var(--safe-bottom),12px))]">
          {children}
        </main>
        <MobileBottomNav items={items} scoped />
      </div>
      <DemoBanner />
    </div>
  );
}
