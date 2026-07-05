"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import {
  ROLEPLAY_RUBRIC,
  ROLEPLAY_SCENARIOS,
  type RubricKey,
} from "@/lib/accord/fixtures";
import { saveRoleplayResult } from "@/lib/accord/store";

type Turn = { role: "customer" | "staff"; body: string };

/**
 * AI相手の接客練習。
 *
 * デモモードでは、お客様役はシナリオ台本を1発話ずつ進める決定的な
 * エンジン（本番では Claude API に置き換わる想定のシーム）。
 * 採点はスタッフ発話のヒューリスティックで行い、観点別に可視化する。
 */
export function RoleplaySession({ scenarioId }: { scenarioId: string }) {
  const scenario = ROLEPLAY_SCENARIOS.find((s) => s.id === scenarioId);
  const [turns, setTurns] = useState<Turn[]>(
    scenario ? [{ role: "customer", body: scenario.opening }] : [],
  );
  const [input, setInput] = useState("");
  const [scriptIndex, setScriptIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: RubricKey[];
  } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, typing, result]);

  if (!scenario) {
    return (
      <p className="text-sm text-stone-500">
        シナリオが見つかりません。
        <Link href="/accord/roleplay" className="text-brand-700 underline">
          一覧へ戻る
        </Link>
      </p>
    );
  }

  const finished = scriptIndex >= scenario.script.length;

  function send() {
    const body = input.trim();
    if (!body || typing || result) return;
    setTurns((t) => [...t, { role: "staff", body }]);
    setInput("");
    if (scriptIndex < scenario!.script.length) {
      setTyping(true);
      const next = scenario!.script[scriptIndex];
      window.setTimeout(() => {
        setTurns((t) => [...t, { role: "customer", body: next }]);
        setScriptIndex((i) => i + 1);
        setTyping(false);
      }, 900);
    }
  }

  function evaluate() {
    const staffText = turns
      .filter((t) => t.role === "staff")
      .map((t) => t.body)
      .join("\n");
    const firstStaff = turns.find((t) => t.role === "staff")?.body ?? "";

    const passed: RubricKey[] = [];
    if (/そうですよね|わかります|不安|おつらい|ですよね|大変でした/.test(staffText))
      passed.push("empathy");
    if (/[?？]/.test(staffText)) passed.push("question");
    if (/腸|原因|仕組み|メカニズム|食事|体の中|内側/.test(staffText))
      passed.push("mechanism");
    if (!/円|price|料金|価格|万/.test(firstStaff)) passed.push("no-rush-price");
    if (/検査|体験|一度|まず|次回|一緒に|小さく/.test(staffText))
      passed.push("next-step");

    const score = Math.round((passed.length / ROLEPLAY_RUBRIC.length) * 100);
    setResult({ score, passed });
    saveRoleplayResult({ scenarioId: scenario!.id, score, passed });
    toast.success("練習おつかれさまでした。フィードバックが届きました");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* シナリオカード */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700">
            {scenario.type}
          </span>
          <span className="text-[11px] text-stone-400">
            むずかしさ {"★".repeat(scenario.difficulty)}
          </span>
        </div>
        <p className="mt-1.5 text-[15px] font-bold text-stone-900">
          {scenario.customer}（{scenario.age}）— {scenario.title}
        </p>
        <p className="mt-1 text-[12.5px] text-stone-600">
          今日のゴール：{scenario.goal}
        </p>
      </div>

      {/* 会話 */}
      <div className="space-y-3 rounded-2xl border border-stone-200 bg-[#fdf7f3] p-4">
        {turns.map((t, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              t.role === "staff" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed",
                t.role === "staff"
                  ? "rounded-br-sm bg-brand-700 text-white"
                  : "rounded-bl-sm border border-stone-200 bg-white text-stone-800",
              )}
            >
              {t.role === "customer" ? (
                <p className="mb-0.5 text-[10px] font-bold text-brand-700">
                  {scenario.customer}
                </p>
              ) : null}
              {t.body}
            </div>
          </div>
        ))}
        {typing ? (
          <p className="text-[12px] text-stone-400">
            {scenario.customer} が入力中…
          </p>
        ) : null}
        <div ref={endRef} />
      </div>

      {/* 入力 or 結果 */}
      {result ? (
        <FeedbackCard score={result.score} passed={result.passed} />
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-white p-3">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder="スタッフとして返答する…"
              className="min-h-[52px] flex-1 resize-none rounded-xl border border-stone-200 px-3 py-2 text-[14px] focus:border-brand-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={send}
              disabled={!input.trim() || typing}
              className="rounded-xl bg-brand-700 px-4 text-sm font-bold text-white disabled:opacity-40"
            >
              送信
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[11px] text-stone-400">
              {finished
                ? "お客様の話は一区切りです。カウンセリングを締めましょう。"
                : `残りの展開 ${scenario.script.length - scriptIndex} ターン`}
            </p>
            <button
              type="button"
              onClick={evaluate}
              disabled={turns.filter((t) => t.role === "staff").length === 0}
              className={cn(
                "rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors disabled:opacity-40",
                finished
                  ? "bg-emerald-700 text-white hover:bg-emerald-800"
                  : "border border-stone-300 text-stone-500 hover:border-brand-500",
              )}
            >
              練習を終えて採点する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackCard({
  score,
  passed,
}: {
  score: number;
  passed: RubricKey[];
}) {
  return (
    <div className="rounded-2xl border-2 border-brand-700 bg-white p-5">
      <p className="text-[11px] font-bold uppercase tracking-widest text-brand-700">
        FEEDBACK — 今回の練習
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-4xl font-extrabold text-stone-900">{score}</p>
        <p className="text-sm text-stone-500">/ 100</p>
        <p className="ml-auto text-[12px] font-semibold text-stone-500">
          {score >= 80
            ? "とても良い流れでした"
            : score >= 60
              ? "土台はできています"
              : "焦らず、まず聴くところから"}
        </p>
      </div>
      <ul className="mt-4 space-y-2.5">
        {ROLEPLAY_RUBRIC.map((r) => {
          const ok = passed.includes(r.key);
          return (
            <li key={r.key} className="flex items-start gap-2.5">
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full text-[11px] font-bold",
                  ok
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-stone-100 text-stone-400",
                )}
              >
                {ok ? "✓" : "・"}
              </span>
              <div>
                <p
                  className={cn(
                    "text-[13.5px] font-semibold",
                    ok ? "text-stone-900" : "text-stone-500",
                  )}
                >
                  {r.label}
                  <span className="ml-2 text-[11px] font-bold">
                    {ok ? (
                      <span className="text-emerald-700">できました</span>
                    ) : (
                      <span className="text-stone-400">次の伸びしろ</span>
                    )}
                  </span>
                </p>
                <p className="text-[12px] text-stone-500">{r.hint}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-brand-700 px-5 py-2 text-sm font-bold text-white hover:bg-brand-500"
        >
          もう一度練習する
        </button>
        <Link
          href="/accord/roleplay"
          className="rounded-full border border-stone-300 px-5 py-2 text-sm font-bold text-stone-600 hover:border-brand-500"
        >
          ほかのお客様で練習 →
        </Link>
      </div>
    </div>
  );
}
