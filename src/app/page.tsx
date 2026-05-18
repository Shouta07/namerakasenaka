import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DemoBanner } from "@/components/demo-banner";
import { isDemoMode, demoKpis } from "@/lib/demo";

export default function HomePage() {
  const demo = isDemoMode();
  return (
    <>
      <DemoBanner />
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12">
        <p className="text-sm font-medium text-brand-700">Senacare</p>
        <h1 className="mt-2 text-4xl font-bold leading-tight text-stone-900">
          来店と来店の「間」を、サロンの強みに。
        </h1>
        <p className="mt-4 text-base text-stone-600">
          高単価背中ケア専門サロンのための、進捗写真・施術カルテ・予約・Q&A
          を一元化する顧客管理プラットフォームです。
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/login">
            <Button size="lg">{demo ? "デモを試す" : "ログイン"}</Button>
          </Link>
          <Link
            href="/c/progress"
            className="inline-flex h-14 items-center px-2 text-sm text-stone-500 hover:text-stone-700"
          >
            会員画面プレビュー →
          </Link>
        </div>

        {demo ? (
          <section className="mt-12 rounded-xl border border-stone-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              本日のサンプル KPI
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Kpi label="本日来店" value={demoKpis.todayAppointments} />
              <Kpi label="今月新規" value={demoKpis.monthlyNewClients} />
              <Kpi label="完遂" value={demoKpis.monthlyCompletions} />
              <Kpi label="要対応Q&A" value={demoKpis.pendingQa} />
            </dl>
          </section>
        ) : null}

        <p className="mt-12 text-xs text-stone-400">
          ご利用にはサロン管理者からの招待リンクが必要です。
        </p>
      </main>
    </>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-stone-900">{value}</dd>
    </div>
  );
}
