import Link from "next/link";
import { ModuleGate } from "@/components/vitality-design/module-panel";
import { CopilotBrief } from "@/components/vitality-design/copilot-brief";
import { DayOneGate } from "@/components/vitality-design/day-one";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "上達 — 接客と継続のコパイロット" };

/** 月1回ひらく道具は、ここに集める。毎日の動線（お客様）と混ぜない。 */
const TOOLS = [
  {
    href: "/vitality-design/roleplay",
    emoji: "🎭",
    title: "接客練習",
    body: "AIのお客様を相手に、苦手な場面だけくり返す。終わったら5観点でふり返りが出ます。",
  },
  {
    href: "/vitality-design/dashboard",
    emoji: "📊",
    title: "今月の数字",
    body: "初回予約から成約までのどこで離れているか。スタッフ別の成約率も見えます。",
  },
];

/**
 * 接客と継続のコパイロット — 今日のブリーフ。
 * 気づき → 提案 → ワンタップ実行 → 効果測定 のループを1画面で見せる（saas-design §8B）。
 * スコープは成約・継続・練習に限定。経営分析全般は業務基盤（B4A等）の領域（§2.3b）。
 */
export default function VitalityDesignCopilotPage() {
  return (
    <ModuleGate module="copilot">
      <div className="space-y-6">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
            COPILOT — 接客と継続のコパイロット
          </p>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">
            記録はお使いのシステムで。<span className="text-brand-700">上達は、Vitality Design で。</span>
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-stone-600">
            予約・カルテのシステムはそのままに、成約・継続・練習のデータからコパイロットが
            毎朝「気づき」と「次の一手」を届けます。提案はその場で実行でき、効果は翌週のブリーフで報告されます。
          </p>
        </header>

        {/* 月1回の道具 — ナビから外したぶん、入口はここに集約する */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-brand-500 hover:shadow-sm"
            >
              <p className="text-2xl" aria-hidden>
                {t.emoji}
              </p>
              <p className="mt-1.5 text-[14px] font-bold text-stone-900 group-hover:text-brand-700">
                {t.title} →
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-stone-600">
                {t.body}
              </p>
            </Link>
          ))}
        </section>
        <DayOneGate
          empty={
            <EmptyState
              emoji="🌤"
              title="最初のブリーフは、2週間後に届きます"
              body="コパイロットは、カウンセリングと練習の記録がたまるほど当たるようになります。まずは記録を1週間ぶん残してみてください。それまでは、こちらから使いはじめるのがおすすめです。"
              action={{ href: "/vitality-design/roleplay", label: "接客練習をはじめる" }}
              secondary={{ href: "/vitality-design/labtest", label: "検査の翻訳を見る" }}
            />
          }
        >
          <CopilotBrief />
        </DayOneGate>
      </div>
    </ModuleGate>
  );
}
