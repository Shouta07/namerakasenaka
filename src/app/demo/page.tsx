import Link from "next/link";
import {
  Camera,
  LineChart,
  Salad,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
import type { ComponentType } from "react";
import { demoOrganization } from "@/lib/demo/fixtures";

type TourCard = {
  href: string;
  title: string;
  subtitle: string;
  bullets: string[];
  icon: ComponentType<{ className?: string }>;
  gradient: string;
};

const tours: TourCard[] = [
  {
    href: "/demo/client",
    title: "顧客の体験",
    subtitle: "進捗タイムライン / 比較ビュー / 食事フィードバック",
    bullets: [
      "4 週分の Before/After 写真をタイムラインで確認",
      "1 タップで Week 1 と Week 4 を並べて比較",
      "AI + 管理栄養士 + サロンの 3 層フィードバック",
    ],
    icon: Camera,
    gradient: "from-brand-100 via-brand-50 to-amber-50",
  },
  {
    href: "/demo/therapist",
    title: "セラピストの作業",
    subtitle: "担当顧客 / 90 秒カルテ / 動画記録",
    bullets: [
      "本日の予約 4 件を即時に俯瞰",
      "施術後 90 秒で記録が完了するフォーム",
      "動画記録で属人化を脱却する施術カルテ",
    ],
    icon: Stethoscope,
    gradient: "from-emerald-50 via-stone-50 to-amber-50",
  },
  {
    href: "/demo/admin",
    title: "経営者の視点",
    subtitle: "KPI ダッシュボード / 顧客一覧 / スタッフ実績",
    bullets: [
      "本日来店・新規・完遂率・Q&A 残のリアルタイム可視化",
      "セラピスト 3 名のパフォーマンス比較",
      "未対応 Q&A の優先アラート",
    ],
    icon: LineChart,
    gradient: "from-stone-100 via-brand-50 to-amber-50",
  },
  {
    href: "/demo/nutritionist",
    title: "栄養士の監修",
    subtitle: "AI 下書きレビュー / 監修ログ",
    bullets: [
      "AI 下書きをレビュー画面で承認・編集",
      "薬機法・健康増進法に配慮した文言ガイド",
      "免許番号 + 承認時刻の監査ログ",
    ],
    icon: Salad,
    gradient: "from-amber-50 via-emerald-50 to-stone-100",
  },
];

export default function DemoTourPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <section className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-700">
          Senacare ツアー
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
          実際の画面で機能を体験
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-stone-600 sm:text-base">
          {demoOrganization.name}{" "}
          を題材にした、ログイン不要のプロダクトツアーです。4
          つの視点から、サロンの &quot;来店と来店の間&quot; を埋める仕組みを体感してください。
        </p>
      </section>

      <section className="mt-12 grid gap-5 sm:grid-cols-2">
        {tours.map((tour, idx) => {
          const Icon = tour.icon;
          return (
            <Link
              key={tour.href}
              href={tour.href}
              className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${tour.gradient}`}
              >
                <Icon className="h-12 w-12 text-brand-700" />
                <span className="absolute left-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-xs font-semibold text-brand-700">
                  {idx + 1}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-lg font-semibold text-stone-900">
                  {tour.title}
                </h2>
                <p className="mt-1 text-xs text-stone-500">{tour.subtitle}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-stone-700">
                  {tour.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 group-hover:gap-2">
                  見てみる
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="mt-12 rounded-2xl border border-stone-200 bg-white p-6 text-center">
        <p className="text-sm font-medium text-stone-700">
          表示されている全てのデータはサンプルです。
        </p>
        <p className="mt-1 text-xs text-stone-500">
          本番接続後は、サロンごとの実データに自動的に切り替わります。
        </p>
      </section>
    </main>
  );
}
