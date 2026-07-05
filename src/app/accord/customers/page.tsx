import Link from "next/link";
import { ModuleGate } from "@/components/accord/module-panel";
import { ACCORD_CUSTOMERS } from "@/lib/accord/fixtures";
import { cn } from "@/lib/utils/cn";

export const metadata = { title: "顧客フォロー" };

const STATUS_STYLE: Record<string, string> = {
  契約中: "bg-emerald-50 text-emerald-700",
  提案中: "bg-amber-50 text-amber-700",
  体験予約: "bg-stone-100 text-stone-600",
};

export default function AccordCustomersPage() {
  return (
    <ModuleGate module="followup">
      <div className="space-y-6">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
            FOLLOW-UP — 顧客別の継続フォロー
          </p>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">
            成約のあとの関わりが、資産になる。
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-stone-600">
            カウンセリング・施術・LINE共有・気づきを顧客ごとのタイムラインに。
            担当が変わっても、「この方とどう関わってきたか」が引き継げます。
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ACCORD_CUSTOMERS.map((c) => (
            <Link
              key={c.id}
              href={`/accord/customers/${c.id}`}
              className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-brand-500 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-[15.5px] font-bold text-stone-900">
                  {c.name} <span className="text-[12px] font-medium text-stone-400">（{c.age}）</span>
                </p>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                    STATUS_STYLE[c.status],
                  )}
                >
                  {c.status}
                </span>
              </div>
              <p className="mt-0.5 text-[12px] text-stone-500">{c.statusNote}</p>
              <p className="mt-3 flex-1 text-[13px] leading-relaxed text-stone-600">
                {c.concern}
              </p>
              <div className="mt-3 border-t border-stone-100 pt-2.5">
                <p className="text-[11px] font-bold text-brand-700">次のアクション</p>
                <p className="mt-0.5 text-[12.5px] text-stone-700">{c.nextAction}</p>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-400">
                <span>担当：{c.assignedTo}</span>
                <span>{c.lineConsent ? "💬 LINE同意あり" : "LINE未同意"}</span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </ModuleGate>
  );
}
