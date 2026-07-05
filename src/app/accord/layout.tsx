import type { Metadata } from "next";
import { AccordNav } from "@/components/accord/accord-nav";

export const metadata: Metadata = {
  title: {
    default: "Accord ｜ 初回カウンセリング支援",
    template: "%s ｜ Accord",
  },
  description:
    "クリニック・サロンの初回カウンセリングを支援。AI相手の接客練習、成約の見える化、月1回の伴走でスタッフの接客を底上げします。",
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
        <p className="border-t border-stone-200 pt-4 text-[11px] text-stone-400">
          Accord — バイタリティデザイン合同会社 ｜ 本画面はデモです（操作はこの端末にのみ保存されます）
        </p>
      </footer>
    </div>
  );
}
