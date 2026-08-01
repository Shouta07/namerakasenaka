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
          ACCORD — 血液検査 × 肌改善サロン・クリニック専用
        </p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl">
          血液検査を、
          <br className="sm:hidden" />
          <span className="text-brand-700">いちばん強い接客</span>に変える。
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-stone-600">
          Accord は、血液検査を接客に使う肌改善サロン・クリニック（背中ニキビ・肌質改善）専用の SaaS です。
          <strong className="text-stone-800">検査結果の翻訳ガイド</strong>で成約を決め、
          <strong className="text-stone-800">LINE経過共有と継続フォロー</strong>で施術後も伴走し、
          <strong className="text-stone-800">再検査サイクル</strong>で改善を数字で見せて続けてもらう。
          「施術して終わり」を終わらせ、<strong className="text-stone-800">伴走を御社の商品に</strong>します。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/accord/labtest"
            className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-500"
          >
            🩸 検査から継続伴走までを見る
          </Link>
          <Link
            href="/accord/roleplay"
            className="rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-bold text-stone-700 transition hover:border-brand-500"
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
            emoji: "🩸",
            title: "検査を翻訳して、成約を決める",
            body: "血液検査の結果を「あなたの体で起きていること」の言葉と図解に翻訳。納得が、いちばん強いクロージングです。",
          },
          {
            emoji: "🌱",
            title: "施術後も、伴走が続く",
            body: "LINE経過共有と「今日のひとつ」で来店の間も関わり続け、6ヶ月後の再検査で改善を数字で見せる。継続の理由が積み上がります。",
          },
          {
            emoji: "🎭",
            title: "練習と数字で、店が上手くなる",
            body: "AIお客様で何度でも接客練習。成約ダッシュボードとコパイロットが、次に磨くテーマを毎朝提案します。",
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

      {/* エコシステム — これまでの設計とつながる */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
          ECOSYSTEM — これまでの設計と、ひとつながり
        </p>
        <h2 className="mt-1 text-xl font-bold text-stone-900">
          なめらかせなかで作った資産が、そのまま活きる。
        </h2>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-stone-600">
          Accord は独立したツールではなく、なめらかせなか向けに作ってきた
          「体のほんとうの話」の設計思想の上に立つ汎用版です。
          図解・レッスン・LINE共有・伴走ループ — これまでの資産は Accord の中でそのまま使えます。
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              href: "/",
              title: "なめらかせなか CRM",
              body: "1社目のケース。サロン運営の全機能デモ。",
              emoji: "🤍",
            },
            {
              href: "/story",
              title: "使いみち絵巻",
              body: "サロンの一日にどう入るか、6場面の物語。",
              emoji: "📜",
            },
            {
              href: "/lessons-preview",
              title: "レッスン 7章の図解",
              body: "カウンセリング後にお客様が読む学習コンテンツ。",
              emoji: "📘",
            },
            {
              href: "/plans",
              title: "2つの関わり方",
              body: "翻訳・納品（A）と伴走・体験設計（B）のご提案。",
              emoji: "🤝",
            },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-brand-500 hover:shadow-sm"
            >
              <p className="text-xl" aria-hidden>
                {l.emoji}
              </p>
              <p className="mt-1.5 text-[13.5px] font-bold text-stone-900 group-hover:text-brand-700">
                {l.title} →
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-stone-600">
                {l.body}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
