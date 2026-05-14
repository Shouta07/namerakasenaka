import { MobileNav, RoleNav, type NavItem } from "@/components/ui/nav";

const items: NavItem[] = [
  { href: "/c/progress", label: "進捗" },
  { href: "/c/appointments", label: "予約" },
  { href: "/c/qa", label: "Q&A" },
  { href: "/c/self-log", label: "セルフログ" },
  { href: "/c/meals", label: "食事" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <RoleNav title="Client" items={items} />
      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      <MobileNav items={items} />
    </div>
  );
}
