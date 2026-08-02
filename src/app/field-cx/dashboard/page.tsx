import Link from "next/link";
import { ModuleGate } from "@/components/field-cx/module-panel";
import { DayOneGate } from "@/components/field-cx/day-one";
import { EmptyState } from "@/components/ui/empty-state";
import { FunnelChart, StaffChart, TrendChart } from "@/components/field-cx/charts";
import {
  FUNNEL_THIS_MONTH,
  KPI,
  MENTORING,
  MONTHLY_TREND,
} from "@/lib/field-cx/fixtures";

export const metadata = { title: "成約の見える化" };

export default function FieldCxDashboardPage() {
  const thisMonth = MONTHLY_TREND[MONTHLY_TREND.length - 1];
  const rate = Math.round((thisMonth.contracts / thisMonth.counseling) * 100);
  const funnelTop = FUNNEL_THIS_MONTH[0].count;

  return (
    <ModuleGate module="dashboard">
      <div className="space-y-6">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
            DASHBOARD — 成約の見える化（{thisMonth.month}）
          </p>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">
            どこで離れているかが、見える。
          </h1>
        </header>

        <DayOneGate
          empty={
            <EmptyState
              emoji="📊"
              title="まだ数字はありません。それでいいです"
              body="カウンセリングを記録していくと、初回予約から成約までのどこで離れているかが見えてきます。最初の1ヶ月は、記録を残すことだけに集中してください。"
              action={{ href: "/field-cx/customers", label: "顧客フォローを見る" }}
              secondary={{ href: "/field-cx/roleplay", label: "接客練習をはじめる" }}
            />
          }
        >
          <div className="space-y-6">

        {/* KPI タイル */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border-2 border-brand-700 bg-white p-4">
            <p className="text-[11px] font-semibold text-stone-500">今月の成約率</p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums text-brand-700">
              {rate}%
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-700">
              ▲ 前月 {Math.round((MONTHLY_TREND[4].contracts / MONTHLY_TREND[4].counseling) * 100)}% から改善
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-[11px] font-semibold text-stone-500">初回予約</p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums text-stone-900">
              {funnelTop}
              <span className="ml-1 text-sm font-semibold text-stone-400">件</span>
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-[11px] font-semibold text-stone-500">平均成約単価</p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums text-stone-900">
              ¥{Math.round(KPI.avgContractValue / 10000)}
              <span className="text-sm font-semibold text-stone-400">.{String(KPI.avgContractValue % 10000).slice(0, 1)}万</span>
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-[11px] font-semibold text-stone-500">練習セッション</p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums text-stone-900">
              {KPI.practiceSessionsThisMonth}
              <span className="ml-1 text-sm font-semibold text-stone-400">回</span>
            </p>
            <Link href="/field-cx/roleplay" className="inline-flex min-h-11 items-center text-[11px] font-semibold text-brand-700 hover:underline">
              練習する →
            </Link>
          </div>
        </section>

        {/* チャート2枚 */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="text-[14px] font-bold text-stone-900">
              初回予約 → 成約 ファネル（今月）
            </h2>
            <div className="mt-4">
              <FunnelChart />
            </div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="text-[14px] font-bold text-stone-900">成約率の推移（6ヶ月）</h2>
            <div className="mt-2">
              <TrendChart />
            </div>
          </div>
        </section>

        {/* スタッフ別 + 月1伴走 */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="text-[14px] font-bold text-stone-900">
              スタッフ別 成約率（今月）
            </h2>
            <div className="mt-4">
              <StaffChart />
            </div>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-stone-900">🤝 月1回の伴走</h2>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-brand-700">
                次回 7/15（水）
              </span>
            </div>
            <p className="mt-2.5 text-[12px] font-semibold text-stone-500">
              {MENTORING.lastReport.month}の振り返りハイライト
            </p>
            <ul className="mt-1.5 space-y-1.5">
              {MENTORING.lastReport.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-[13px] leading-relaxed text-stone-700">
                  <span className="text-emerald-700">✓</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3.5 rounded-xl border border-brand-100 bg-white p-3">
              <p className="text-[11px] font-bold text-brand-700">来月のテーマ</p>
              <p className="mt-0.5 text-[13.5px] font-semibold text-stone-800">
                {MENTORING.lastReport.nextTheme}
              </p>
              <Link
                href="/field-cx/roleplay/price-hesitation"
                className="inline-flex min-h-11 items-center text-[12px] font-semibold text-brand-700 hover:underline"
              >
                このテーマの練習シナリオへ →
              </Link>
            </div>
          </div>
        </section>
          </div>
        </DayOneGate>
      </div>
    </ModuleGate>
  );
}
