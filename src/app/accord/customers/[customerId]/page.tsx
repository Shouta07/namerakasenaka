import Link from "next/link";
import { notFound } from "next/navigation";
import { ModuleGate } from "@/components/accord/module-panel";
import { CustomerActions } from "@/components/accord/customer-actions";
import { ACCORD_CUSTOMERS, KIND_META } from "@/lib/accord/fixtures";
import { cn } from "@/lib/utils/cn";

export function generateStaticParams() {
  return ACCORD_CUSTOMERS.map((c) => ({ customerId: c.id }));
}

const STATUS_STYLE: Record<string, string> = {
  契約中: "bg-emerald-50 text-emerald-700",
  提案中: "bg-amber-50 text-amber-700",
  体験予約: "bg-stone-100 text-stone-600",
};

export default async function AccordCustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  const customer = ACCORD_CUSTOMERS.find((c) => c.id === customerId);
  if (!customer) notFound();

  return (
    <ModuleGate module="followup">
      <div className="space-y-6">
        <Link
          href="/accord/customers"
          className="text-[12px] font-semibold text-stone-500 hover:text-brand-700"
        >
          ← 顧客一覧へ
        </Link>

        <header className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-stone-900">
              {customer.name}{" "}
              <span className="text-sm font-medium text-stone-400">
                （{customer.age}）
              </span>
            </h1>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                STATUS_STYLE[customer.status],
              )}
            >
              {customer.status}
            </span>
            <span className="text-[12px] text-stone-500">{customer.statusNote}</span>
            <span className="ml-auto text-[12px] text-stone-400">
              担当：{customer.assignedTo}
            </span>
          </div>
          <p className="mt-3 text-[13.5px] leading-relaxed text-stone-700">
            {customer.concern}
          </p>
          <div className="mt-3 rounded-xl bg-brand-50/60 p-3">
            <p className="text-[11px] font-bold text-brand-700">次のアクション</p>
            <p className="mt-0.5 text-[13.5px] font-semibold text-stone-800">
              {customer.nextAction}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          {/* タイムライン */}
          <section className="lg:col-span-3">
            <h2 className="text-[13px] font-bold uppercase tracking-widest text-stone-400">
              TIMELINE — この方との関わり
            </h2>
            <ol className="mt-3 space-y-0">
              {customer.timeline.map((t, i) => {
                const meta = KIND_META[t.kind];
                const last = i === customer.timeline.length - 1;
                return (
                  <li key={t.id} className="relative flex gap-3.5 pb-5">
                    {!last ? (
                      <span
                        aria-hidden
                        className="absolute left-[15px] top-9 h-[calc(100%-2rem)] w-px bg-stone-200"
                      />
                    ) : null}
                    <span
                      aria-hidden
                      className="z-10 grid h-8 w-8 flex-none place-items-center rounded-full border border-stone-200 bg-white text-[14px]"
                    >
                      {meta.emoji}
                    </span>
                    <div className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-white p-3.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[13.5px] font-bold text-stone-900">
                          {t.title}
                        </p>
                        <p className="flex-none text-[11px] tabular-nums text-stone-400">
                          {t.at.slice(5).replace("-", "/")}
                        </p>
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-stone-600">
                        {t.body}
                      </p>
                      <span className="mt-1.5 inline-block rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-500">
                        {meta.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* アクション（LINE共有・メモ） */}
          <aside className="lg:col-span-2">
            <h2 className="text-[13px] font-bold uppercase tracking-widest text-stone-400">
              ACTIONS
            </h2>
            <div className="mt-3">
              <CustomerActions customer={customer} />
            </div>
          </aside>
        </div>
      </div>
    </ModuleGate>
  );
}
