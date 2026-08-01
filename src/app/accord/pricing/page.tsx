import Link from "next/link";
import { ToppingMatrix } from "@/components/toppings/topping-matrix";
import { PLAN_META, annualJpy } from "@/lib/toppings/plans";
import { PLAN_ORDER } from "@/lib/toppings/types";

export const metadata = { title: "料金・トッピング" };

/**
 * Accord 料金ページ。プラン×トッピング表をレジストリから描く。
 * 「機能をトッピングできる」を、そのまま営業トークにする画面。
 */
export default function AccordPricingPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
          PRICING — 機能はトッピングできます
        </p>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">
          必要な機能だけ、必要なぶんだけ。
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-stone-600">
          Accord は血液検査を接客に使う肌改善サロン・クリニック専用の SaaS。
          「生地（顧客台帳・カウンセリング記録）」の上に、検査翻訳・伴走・練習の機能をトッピングして使います。
          プランは必要なトッピングをまとめた3つの束。店舗のフェーズに合わせて、上のプランへ増やせます。
        </p>
      </header>

      {/* プラン3枚 */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLAN_ORDER.map((p) => {
          const meta = PLAN_META[p];
          const featured = p === "standard";
          return (
            <div
              key={p}
              className={`rounded-2xl border bg-white p-5 ${
                featured ? "border-2 border-brand-700" : "border-stone-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-extrabold text-stone-900">
                  {meta.name}
                </p>
                {featured ? (
                  <span className="rounded-full bg-brand-700 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    人気
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[12px] text-stone-500">{meta.target}</p>
              <p className="mt-3 text-3xl font-extrabold text-brand-700">
                ¥{meta.priceJpy.toLocaleString()}
                <span className="text-sm font-semibold text-stone-400">/月</span>
              </p>
              <p className="mt-0.5 text-[11px] text-stone-400">
                年払い ¥{annualJpy(p).toLocaleString()}/年（10% OFF）
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-stone-700">
                {meta.tagline}
              </p>
            </div>
          );
        })}
      </section>

      {/* トッピング表 */}
      <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
        <h2 className="mb-3 text-[14px] font-bold text-stone-900">
          プラン × トッピング一覧
        </h2>
        <ToppingMatrix />
      </section>

      {/* 注記 */}
      <section className="rounded-2xl border border-stone-200 bg-brand-50/40 p-5">
        <p className="text-[13px] font-bold text-stone-900">補足</p>
        <ul className="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-stone-600">
          <li>・14日間の無料トライアル（導入面談つき）。数字が出てから有償化を判断できます。</li>
          <li>・料金は3プランのみ。まず必要な機能が揃った束から始められます。</li>
          <li>・初期セットアップ・体験設計は別建て（月額とは別レイヤー）。</li>
          <li>・トッピングをオフにしてもデータは消えません（再開すれば元通り）。</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/accord"
            className="rounded-full border border-stone-300 px-4 py-2 text-[13px] font-bold text-stone-700 hover:border-brand-500"
          >
            ← 概要に戻る
          </Link>
          <Link
            href="/accord/roleplay"
            className="rounded-full bg-brand-700 px-4 py-2 text-[13px] font-bold text-white hover:bg-brand-500"
          >
            接客練習を試す →
          </Link>
        </div>
      </section>
    </div>
  );
}
