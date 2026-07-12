import { ModuleGate } from "@/components/accord/module-panel";
import { CopilotBrief } from "@/components/accord/copilot-brief";

export const metadata = { title: "経営コパイロット" };

/**
 * 経営コパイロット — 今日のブリーフ。
 * 気づき → 提案 → ワンタップ実行 → 効果測定 のループを1画面で見せる（saas-design §8B）。
 */
export default function AccordCopilotPage() {
  return (
    <ModuleGate module="copilot">
      <div className="space-y-6">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
            COPILOT — 経営コパイロット
          </p>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">
            数字を見せるだけでは、終わらせない。
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-stone-600">
            Accord とお使いのシステムのデータから、コパイロットが毎朝「気づき」と「次の一手」を届けます。
            提案はその場で実行でき、効果は翌週のブリーフで報告されます。
          </p>
        </header>
        <CopilotBrief />
      </div>
    </ModuleGate>
  );
}
