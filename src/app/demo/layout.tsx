import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-30 border-b border-amber-200 bg-amber-100/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2 text-amber-900">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 text-xs font-medium hover:text-amber-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            ツアー一覧へ
          </Link>
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            DEMO TOUR — サンプルデータ表示中
          </p>
          <Link
            href="#contact"
            className="hidden text-xs font-medium hover:text-amber-700 sm:inline"
          >
            本番運用のお問合せ →
          </Link>
        </div>
      </header>
      {children}
      <footer id="contact" className="mt-16 border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-700">
            Senacare
          </p>
          <h2 className="mt-2 text-2xl font-bold text-stone-900">
            ここまでがプロダクトの 4 つの体験です。
          </h2>
          <p className="mt-3 text-sm text-stone-600">
            導入のご相談・実データでのトライアルは、こちらからお気軽にお問合せください。
          </p>
          <a
            href="mailto:hello@senacare.jp"
            className="mt-6 inline-flex h-12 items-center rounded-lg bg-brand-500 px-6 text-sm font-semibold text-white hover:bg-brand-700"
          >
            導入相談を申し込む
          </a>
          <p className="mt-4 text-[11px] text-stone-400">
            表示されているデータは全てサンプルです。実在の顧客・店舗とは関係ありません。
          </p>
        </div>
      </footer>
    </div>
  );
}
