import type { Metadata } from "next";
import { AccordNav } from "@/components/accord/accord-nav";

export const metadata: Metadata = {
  title: {
    default: "Accord ｜ 血液検査 × 肌改善の継続伴走 SaaS",
    template: "%s ｜ Accord",
  },
  description:
    "血液検査を接客に使う肌改善サロン・クリニック専用。検査の翻訳ガイド、AI接客練習、成約の見える化、再検査サイクルまで——施術後の継続伴走を商品にできます。",
};

export default function AccordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[#faf8f4]">
      <AccordNav />
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</main>
      <footer className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
        <p className="flex flex-wrap items-center gap-x-3 border-t border-stone-200 pt-4 text-[11px] text-stone-400">
          <span>
            Accord — バイタリティデザイン合同会社 ｜ 本画面はデモです（操作はこの端末にのみ保存されます）。機能の増減と導入初日の表示は、右上の「デモ設定」から。
          </span>
          <a
            href="/hub"
            className="inline-flex min-h-11 items-center font-semibold text-brand-700 hover:underline"
          >
            すべての画面・資料 → /hub
          </a>
        </p>
      </footer>
    </div>
  );
}
