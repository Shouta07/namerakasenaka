import Link from "next/link";
import { ModulePanel } from "@/components/accord/module-panel";

/**
 * Accord 概要 — サービスの3本柱と、機能モジュールの増減。
 */
export default function AccordHomePage() {
  return (
    <div className="space-y-10">
      {/* ヒーロー */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
          ACCORD — 初回カウンセリング支援
        </p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl">
          初回カウンセリングを、
          <br className="sm:hidden" />
          <span className="text-brand-700">いちばん得意な接客</span>に。
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-stone-600">
          Accord は、クリニック・サロンの初回カウンセリングを支援するサービスです。
          <strong className="text-stone-800">AI相手の接客練習</strong>、
          <strong className="text-stone-800">成約の見える化ダッシュボード</strong>、
          <strong className="text-stone-800">月1回の伴走</strong>で、スタッフの接客を底上げ。
          記録や写真の経過は、ご本人の同意のもと LINE でお客様の手元にも届きます。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/accord/roleplay"
            className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-500"
          >
            🎭 接客練習をはじめる
          </Link>
          <Link
            href="/accord/dashboard"
            className="rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-bold text-stone-700 transition hover:border-brand-500"
          >
            📊 今月の数字を見る
          </Link>
        </div>
      </section>

      {/* 3本柱 */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            emoji: "🎭",
            title: "練習してから、本番へ",
            body: "AIがお客様役。不安型・比較検討型・不信型 — 苦手なお客様ほど、何度でも練習できます。",
          },
          {
            emoji: "📊",
            title: "感覚ではなく、数字で",
            body: "初回予約から成約までのどこで離れているかが見える。練習のテーマが数字から決まります。",
          },
          {
            emoji: "🤝",
            title: "月に一度、一緒に振り返る",
            body: "数字と練習ログを見ながら翌月のテーマを決める伴走。導入して終わり、にしません。",
          },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-2xl" aria-hidden>
              {c.emoji}
            </p>
            <h2 className="mt-2 text-[15px] font-bold text-stone-900">{c.title}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-stone-600">{c.body}</p>
          </div>
        ))}
      </section>

      {/* モジュール管理 */}
      <section>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
              MODULES — 機能の増減
            </p>
            <h2 className="mt-1 text-xl font-bold text-stone-900">
              必要な機能だけ、必要なときに。
            </h2>
          </div>
        </div>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-stone-600">
          Accord はモジュール式です。まず小さく始めて、店舗のフェーズに合わせて機能を足し引きできます。
          オフにするとナビからも消えます — 使わない機能が画面を圧迫しません。
        </p>
        <div className="mt-5">
          <ModulePanel />
        </div>
      </section>
    </div>
  );
}
