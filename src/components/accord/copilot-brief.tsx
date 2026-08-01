"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import {
  COPILOT_BRIEF,
  COPILOT_LAST_WINS,
  type CopilotInsight,
  type CopilotSeverity,
} from "@/lib/accord/fixtures";
import {
  getCopilotDecisions,
  recordCopilotDecision,
  type StoredCopilotDecision,
} from "@/lib/accord/store";

/**
 * 経営コパイロット「今日のブリーフ」。
 *
 * 北極星の体験（saas-design §8B.1）:
 *   気づき → 打ち手の提案 → ワンタップ実行 → 効果測定 が1画面で閉じる。
 * デモでは第1層（ルール検出）の結果をフィクスチャで再現し、実行は
 * localStorage に永続化する。提案の実行は必ず人の承認を挟む思想なので、
 * ボタンは「準備する/変更する」であり自動送信はしない。
 */

const SEVERITY_META: Record<
  CopilotSeverity,
  { label: string; chip: string; border: string }
> = {
  attention: {
    label: "要注意",
    chip: "bg-amber-100 text-amber-800",
    border: "border-amber-200",
  },
  opportunity: {
    label: "チャンス",
    chip: "bg-emerald-100 text-emerald-800",
    border: "border-emerald-200",
  },
  info: {
    label: "気づき",
    chip: "bg-stone-100 text-stone-600",
    border: "border-stone-200",
  },
};

export function CopilotBrief() {
  const [decisions, setDecisions] = useState<
    Record<string, StoredCopilotDecision>
  >({});

  useEffect(() => {
    const sync = () => setDecisions({ ...getCopilotDecisions() });
    sync();
    window.addEventListener("accord-store", sync);
    return () => window.removeEventListener("accord-store", sync);
  }, []);

  const openCount = COPILOT_BRIEF.filter((i) => !decisions[i.id]).length;

  return (
    <div className="space-y-6">
      {/* サマリ行 */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/50 px-4 py-3">
        <span className="text-xl" aria-hidden>
          🧠
        </span>
        <p className="text-[13.5px] font-semibold text-stone-800">
          今日のブリーフ —{" "}
          {openCount > 0 ? (
            <>
              打ち手の提案が{" "}
              <span className="font-extrabold text-brand-700">{openCount}件</span>{" "}
              あります
            </>
          ) : (
            "すべて対応済みです。おつかれさまでした 🌿"
          )}
        </p>
        <p className="ml-auto text-[11px] text-stone-400">
          数字は責める道具ではなく、次の練習と一手を決める材料です
        </p>
      </div>

      {/* インサイトカード — 出すのは1件だけ。残りは畳む。
          4件を並べると、どれから手をつけるか決められなくなる。 */}
      <div className="space-y-4">
        <InsightCard
          insight={COPILOT_BRIEF[0]}
          decision={decisions[COPILOT_BRIEF[0].id]}
        />
        {COPILOT_BRIEF.length > 1 ? (
          <details className="group">
            <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-[12.5px] font-bold text-brand-700">
              ほかの気づき {COPILOT_BRIEF.length - 1} 件を見る
              <span className="ml-1 transition group-open:rotate-180" aria-hidden>
                ▾
              </span>
            </summary>
            <div className="mt-3 space-y-4">
              {COPILOT_BRIEF.slice(1).map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  decision={decisions[insight.id]}
                />
              ))}
            </div>
          </details>
        ) : null}
      </div>

      {/* 先週の効果（ループが閉じる証拠） */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <p className="text-[12px] font-bold uppercase tracking-widest text-stone-400">
          LAST WEEK — 実行した提案のその後
        </p>
        <ul className="mt-2.5 space-y-1.5">
          {COPILOT_LAST_WINS.map((w) => (
            <li key={w} className="flex gap-2 text-[13px] leading-relaxed text-stone-700">
              <span className="text-emerald-700">✓</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-stone-400">
          ※ 効果は参考値です。因果を断定するものではありません。
        </p>
      </section>
    </div>
  );
}

function InsightCard({
  insight,
  decision,
}: {
  insight: CopilotInsight;
  decision?: StoredCopilotDecision;
}) {
  const meta = SEVERITY_META[insight.severity];
  const [showEvidence, setShowEvidence] = useState(false);

  function act() {
    recordCopilotDecision(insight.id, "done");
    toast.success("提案を実行キューに入れました（デモ）");
  }
  function dismiss() {
    recordCopilotDecision(insight.id, "dismissed");
    toast("この提案を見送りました");
  }

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white p-5 transition-opacity",
        meta.border,
        decision?.status === "dismissed" && "opacity-55",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-2.5 py-0.5 text-[10.5px] font-bold", meta.chip)}>
          {meta.label}
        </span>
        <h2 className="text-[15.5px] font-bold text-stone-900">{insight.title}</h2>
        {decision?.status === "done" ? (
          <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-700">
            ✓ 実行済み
          </span>
        ) : decision?.status === "dismissed" ? (
          <span className="ml-auto rounded-full bg-stone-100 px-2.5 py-0.5 text-[10.5px] font-bold text-stone-500">
            見送り
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-[14px] leading-relaxed text-stone-700">{insight.body}</p>

      {/* 根拠（第1層の事実） */}
      <button
        type="button"
        onClick={() => setShowEvidence((v) => !v)}
        className="mt-1.5 inline-flex min-h-11 items-center text-[12px] font-semibold text-brand-700 hover:underline"
      >
        {showEvidence ? "根拠をとじる ▲" : "根拠の数字を見る ▼"}
      </button>
      {showEvidence ? (
        <ul className="mt-2 space-y-1 rounded-xl bg-stone-50 p-3">
          {insight.evidence.map((e) => (
            <li key={e} className="text-[12.5px] tabular-nums text-stone-600">
              ・{e}
            </li>
          ))}
        </ul>
      ) : null}

      {/* アクション */}
      {decision?.status === "done" ? (
        <div className="mt-3.5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5">
          <p className="text-[12.5px] leading-relaxed text-emerald-900">
            {insight.doneEffect}
          </p>
        </div>
      ) : decision?.status !== "dismissed" ? (
        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
          {insight.action.href ? (
            <Link
              href={insight.action.href}
              onClick={() => recordCopilotDecision(insight.id, "done")}
              className="inline-flex min-h-11 items-center rounded-full bg-brand-700 px-4 text-[13px] font-bold text-white transition hover:bg-brand-500"
            >
              {insight.action.label} →
            </Link>
          ) : (
            <button
              type="button"
              onClick={act}
              className="inline-flex min-h-11 items-center rounded-full bg-brand-700 px-4 text-[13px] font-bold text-white transition hover:bg-brand-500"
            >
              {insight.action.label}
            </button>
          )}
          <span className="text-[11px] text-stone-400">実行先: {insight.action.via}</span>
          <button
            type="button"
            onClick={dismiss}
            className="ml-auto inline-flex min-h-11 items-center px-2 text-[12px] font-semibold text-stone-400 hover:text-stone-600"
          >
            今回は見送る
          </button>
        </div>
      ) : null}
    </article>
  );
}
