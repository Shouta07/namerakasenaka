import Link from "next/link";
import { ArrowRight, Camera, LineChart, Salad, Stethoscope } from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { DemoBanner } from "@/components/demo-banner";

type ValueProp = {
  href: string;
  title: string;
  body: string;
  icon: ComponentType<{ className?: string }>;
};

const valueProps: ValueProp[] = [
  {
    href: "/demo/client",
    title: "進捗写真タイムライン + 比較",
    body: "来店ごとの Before/After を自動で時系列に。1 タップで初回と最新を並べて比較。",
    icon: Camera,
  },
  {
    href: "/demo/therapist",
    title: "90 秒で完了する施術カルテ",
    body: "音声メモ + 動画記録で属人化を脱却。担当が替わっても顧客体験が落ちません。",
    icon: Stethoscope,
  },
  {
    href: "/demo/admin",
    title: "KPI ダッシュボード",
    body: "本日来店・新規・完遂率・未対応 Q&A・売上見込を 1 画面で。",
    icon: LineChart,
  },
  {
    href: "/demo/nutritionist",
    title: "AI + 管理栄養士の食事 FB",
    body: "AI 下書き → 栄養士監修 → サロンコメントの 3 層構成。法令配慮も組込済。",
    icon: Salad,
  },
];

export default function HomePage() {
  return (
    <>
      <DemoBanner />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <section className="text-center sm:text-left">
          <p className="text-sm font-medium text-brand-700">Senacare</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-stone-900 sm:text-5xl">
            来店と来店の「間」を、サロンの強みに。
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-stone-600 sm:mx-0">
            高単価背中ケア専門サロンのための、進捗写真・施術カルテ・予約・食事フィードバックを一元化する顧客管理プラットフォームです。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <Link href="/demo">
              <Button size="lg">
                ツアーを始める
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              href="/login"
              className="inline-flex h-14 items-center px-2 text-sm text-stone-500 hover:text-stone-700"
            >
              既にご利用中の方 → ログイン
            </Link>
          </div>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-2">
          {valueProps.map((v) => {
            const Icon = v.icon;
            return (
              <Link
                key={v.href}
                href={v.href}
                className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-stone-900">{v.title}</p>
                  <p className="mt-1 text-xs text-stone-600">{v.body}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 group-hover:gap-2">
                    デモを見る
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </section>

        <p className="mt-16 text-center text-xs text-stone-400">
          ご利用にはサロン管理者からの招待リンクが必要です。
        </p>
      </main>
    </>
  );
}
