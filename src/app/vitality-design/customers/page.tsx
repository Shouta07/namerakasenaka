import { ModuleGate } from "@/components/vitality-design/module-panel";
import { CustomerList } from "@/components/vitality-design/customer-list";
import { DayOneGate } from "@/components/vitality-design/day-one";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "顧客フォロー" };

export default function VitalityDesignCustomersPage() {
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

        <DayOneGate
          empty={
            <EmptyState
              emoji="🌱"
              title="最初のお客様を、ここに迎えます"
              body="カウンセリングを1件記録すると、この一覧に並びます。まずは接客練習で流れを確かめてから、当日の記録を残していきましょう。"
              action={{ href: "/vitality-design/roleplay", label: "接客練習で流れを確かめる" }}
              secondary={{ href: "/vitality-design/labtest", label: "検査の見せ方を見る" }}
            />
          }
        >
          <CustomerList />
        </DayOneGate>
      </div>
    </ModuleGate>
  );
}
