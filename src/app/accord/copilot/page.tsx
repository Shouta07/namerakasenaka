import { ModuleGate } from "@/components/accord/module-panel";
import { CopilotBrief } from "@/components/accord/copilot-brief";
import { DayOneGate } from "@/components/accord/day-one";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "接客と継続のコパイロット" };

/**
 * 接客と継続のコパイロット — 今日のブリーフ。
 * 気づき → 提案 → ワンタップ実行 → 効果測定 のループを1画面で見せる（saas-design §8B）。
 * スコープは成約・継続・練習に限定。経営分析全般は業務基盤（B4A等）の領域（§2.3b）。
 */
export default function AccordCopilotPage() {
  return (
    <ModuleGate module="copilot">
      <div className="space-y-6">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
            COPILOT — 接客と継続のコパイロット
          </p>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">
            記録はお使いのシステムで。<span className="text-brand-700">上達は、Accord で。</span>
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-stone-600">
            予約・カルテのシステムはそのままに、成約・継続・練習のデータからコパイロットが
            毎朝「気づき」と「次の一手」を届けます。提案はその場で実行でき、効果は翌週のブリーフで報告されます。
          </p>
        </header>
        <DayOneGate
          empty={
            <EmptyState
              emoji="🌤"
              title="最初のブリーフは、2週間後に届きます"
              body="コパイロットは、カウンセリングと練習の記録がたまるほど当たるようになります。まずは記録を1週間ぶん残してみてください。それまでは、こちらから使いはじめるのがおすすめです。"
              action={{ href: "/accord/roleplay", label: "接客練習をはじめる" }}
              secondary={{ href: "/accord/labtest", label: "検査の翻訳を見る" }}
            />
          }
        >
          <CopilotBrief />
        </DayOneGate>
      </div>
    </ModuleGate>
  );
}
