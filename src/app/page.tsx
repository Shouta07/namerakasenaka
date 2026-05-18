import Link from "next/link";
import {
  CalendarDays,
  Camera,
  LineChart,
  Salad,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
import type { ComponentType } from "react";
import { isDemoMode } from "@/lib/demo";
import { demoOrganization } from "@/lib/demo/fixtures";

type RoleCard = {
  href: string;
  title: string;
  subtitle: string;
  bullets: string[];
  icon: ComponentType<{ className?: string }>;
  gradient: string;
};

const cards: RoleCard[] = [
  {
    href: "/c/progress",
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
    href: "/t/today",
    title: "セラピストの作業",
    subtitle: "担当顧客 / 90 秒カルテ / 動画記録",
    bullets: [
      "本日の予約を即時に俯瞰",
      "施術後 90 秒で記録が完了するフォーム",
      "動画記録で属人化を脱却する施術カルテ",
    ],
    icon: Stethoscope,
    gradient: "from-emerald-50 via-stone-50 to-amber-50",
  },
  {
    href: "/admin/dashboard",
    title: "経営者の視点",
    subtitle: "KPI ダッシュボード / 顧客一覧 / スタッフ実績",
    bullets: [
      "本日来店・新規・完遂率・Q&A 残のリアルタイム可視化",
      "セラピストごとのパフォーマンス比較",
      "未対応 Q&A の優先アラート",
    ],
    icon: LineChart,
    gradient: "from-stone-100 via-brand-50 to-amber-50",
  },
  {
    href: "/n/queue",
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
  {
    href: "/c/calendar",
    title: "カレンダー",
    subtitle: "月次グリッド / 次回推奨枠 / ワンタップ予約",
    bullets: [
      "顧客・セラピスト・経営者の 3 視点で同じカレンダーを共有",
      "コース理解型推奨枠を月グリッド上にハイライト",
      "ワンタップで次の 3 スロット候補を提示し即確定",
    ],
    icon: CalendarDays,
    gradient: "from-brand-50 via-stone-50 to-emerald-50",
  },
];

export default function HomePage() {
  const demo = isDemoMode();
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <section className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-700">
          Senacare
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
          来店と来店の「間」を、サロンの強みに。
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-stone-600 sm:text-base">
          {demo ? (
            <>
              {demoOrganization.name}{" "}
              を題材にしたサンプルデータで、4 つの視点から機能をそのままお試しいただけます。
            </>
          ) : (
            <>
              高単価背中ケア専門サロンのための、進捗写真・施術カルテ・予約・食事フィードバックを一元化する顧客管理プラットフォームです。
            </>
          )}
        </p>
      </section>

      <section className="mt-12 grid gap-5 sm:grid-cols-2">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${card.gradient}`}
              >
                <Icon className="h-12 w-12 text-brand-700" />
                <span className="absolute left-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-xs font-semibold text-brand-700">
                  {idx + 1}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-lg font-semibold text-stone-900">
                  {card.title}
                </h2>
                <p className="mt-1 text-xs text-stone-500">{card.subtitle}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-stone-700">
                  {card.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 group-hover:gap-2">
                  開く
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </section>

      <footer className="mt-12 flex flex-col items-center gap-2 border-t border-stone-200 pt-6 text-center">
        {demo ? (
          <p className="text-xs text-stone-500">
            表示されている全てのデータはサンプルです。本番接続後は、サロンごとの実データに自動的に切り替わります。
          </p>
        ) : (
          <p className="text-xs text-stone-500">
            ご利用にはサロン管理者からの招待リンクが必要です。
          </p>
        )}
        <Link
          href="/login"
          className="text-[11px] text-stone-400 hover:text-stone-600"
        >
          ログイン
        </Link>
      </footer>
    </main>
  );
}
