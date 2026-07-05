import Link from "next/link";
import { ModuleGate } from "@/components/accord/module-panel";
import { RoleplayHistory } from "@/components/accord/roleplay-history";
import { ROLEPLAY_SCENARIOS } from "@/lib/accord/fixtures";

export const metadata = { title: "AI接客練習" };

export default function RoleplayListPage() {
  return (
    <ModuleGate module="roleplay">
      <div className="space-y-8">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
            ROLEPLAY — AI相手の接客練習
          </p>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">
            苦手なお客様ほど、練習できる。
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-stone-600">
            AIがお客様役になって、初回カウンセリングの会話を再現します。
            終了後は5つの観点でフィードバック。本物のお客様で失敗する前に、ここで何度でも。
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ROLEPLAY_SCENARIOS.map((s) => (
            <Link
              key={s.id}
              href={`/accord/roleplay/${s.id}`}
              className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-brand-500 hover:shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700">
                  {s.type}
                </span>
                <span className="text-[11px] text-stone-400">
                  {"★".repeat(s.difficulty)}
                  {"☆".repeat(3 - s.difficulty)}
                </span>
              </div>
              <h2 className="mt-2.5 text-[15.5px] font-bold leading-snug text-stone-900">
                {s.title}
              </h2>
              <p className="mt-1 text-[12.5px] text-stone-500">
                {s.customer}（{s.age}）
              </p>
              <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-stone-600">
                「{s.opening.slice(0, 56)}…」
              </p>
              <p className="mt-3 text-[12px] font-bold text-brand-700 group-hover:underline">
                この方で練習する →
              </p>
            </Link>
          ))}
        </section>

        <RoleplayHistory />
      </div>
    </ModuleGate>
  );
}
