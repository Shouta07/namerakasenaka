"use client";

import { useState } from "react";
import { Leaf, Sparkles } from "lucide-react";
import {
  localDateString,
  useDailyChecksFor,
  useGuideCustomerByToken,
  useHealthRecordFor,
  type DailyCheckRecord,
} from "@/lib/guide/source";
import { upsertStoredDailyCheck, newId } from "@/lib/demo/store";
import { safeParseRecoveryGuideJson } from "@/lib/guide/schema";
import { isDemoMode } from "@/lib/demo";
import { DailyCheckCard, type DailyCheckSubmit } from "./daily-check-card";
import { ChangeRecordCard } from "./change-record-card";

/**
 * /share/[token] — 顧客がスマホで開く「あなた専用の回復ガイド」。
 * 認証なし、URL を知る人だけが見られる。やさしく・清潔に・余白たっぷりに。
 */
export function ShareGuideView({ token }: { token: string }) {
  const customer = useGuideCustomerByToken(token);
  const healthRecord = useHealthRecordFor(customer?.id ?? null);
  const demoChecks = useDailyChecksFor(customer?.id ?? null);
  const [remoteChecks, setRemoteChecks] = useState<DailyCheckRecord[]>([]);

  const demo = isDemoMode();
  const checks = demo ? demoChecks : mergeChecks(demoChecks, remoteChecks);

  if (!customer) {
    return (
      <Shell>
        <div className="rounded-3xl border border-[#e3ece3] bg-white/90 p-8 text-center">
          <p className="text-lg font-medium text-stone-700">ページが見つかりませんでした</p>
          <p className="mt-3 text-base leading-relaxed text-stone-500">
            リンクの有効期限が切れているか、URL が変わった可能性があります。
            お手数ですが、なめらかせなかまでご連絡ください。
          </p>
        </div>
      </Shell>
    );
  }

  const guide = healthRecord?.aiSummaryJson
    ? safeParseRecoveryGuideJson(healthRecord.aiSummaryJson)
    : null;

  const today = localDateString();
  const todayCheck = checks.find((c) => c.date === today) ?? null;

  async function handleCheckSubmit(input: DailyCheckSubmit): Promise<void> {
    if (!customer) return;
    if (demo) {
      upsertStoredDailyCheck({
        guideCustomerId: customer.id,
        date: input.date,
        actionDone: input.actionDone,
        actionLevel: input.actionLevel,
        skinCondition: input.skinCondition,
        bodyCondition: input.bodyCondition,
        memo: input.memo,
      });
      return;
    }
    const res = await fetch("/api/daily-checks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        token,
        date: input.date,
        actionDone: input.actionDone,
        skinCondition: input.skinCondition,
        bodyCondition: input.bodyCondition,
        memo: input.memo,
      }),
    });
    if (!res.ok) throw new Error("save_failed");
    setRemoteChecks((cur) => [
      ...cur.filter((c) => c.date !== input.date),
      {
        id: newId(),
        guideCustomerId: customer.id,
        date: input.date,
        actionDone: input.actionDone,
        actionLevel: input.actionLevel,
        skinCondition: input.skinCondition,
        bodyCondition: input.bodyCondition,
        memo: input.memo,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  return (
    <Shell>
      {/* 1. 挨拶ヘッダ */}
      <header className="px-1 pt-2 text-center">
        <p className="inline-flex items-center gap-1.5 text-sm font-medium tracking-wide text-[#587f63]">
          <Leaf className="h-4 w-4" aria-hidden />
          なめらかせなか
          <Sparkles className="h-4 w-4" aria-hidden />
        </p>
        <h1 className="mt-2 text-2xl font-bold leading-snug text-stone-800">
          {customer.name}さんの回復ガイド
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-stone-500">
          エクシアクリニックの検査結果をもとに、なめらかせなかが作成したあなた専用のガイドです
        </p>
      </header>

      {guide ? (
        <>
          {/* 2. 今日のまとめ */}
          <SoftCard accent>
            <Eyebrow>今日のまとめ</Eyebrow>
            <Paragraphs text={guide.today_summary} lead />
          </SoftCard>

          {/* 3. あなたの身体で起きていること */}
          <SoftCard>
            <Eyebrow>あなたの身体で起きていること</Eyebrow>
            <Paragraphs text={guide.current_body_state} />
            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#7da589]">
                やさしい解説
              </p>
              {guide.easy_explanations.map((e) => (
                <details
                  key={e.term}
                  className="group rounded-2xl border border-[#e3ece3] bg-[#fafcfa] px-4 py-3"
                >
                  <summary className="flex min-h-[28px] cursor-pointer list-none items-center justify-between text-base font-medium text-stone-700 [&::-webkit-details-marker]:hidden">
                    {e.term}
                    <span
                      aria-hidden
                      className="ml-2 text-[#7da589] transition-transform group-open:rotate-45"
                    >
                      ＋
                    </span>
                  </summary>
                  <p className="mt-2 text-base leading-relaxed text-stone-600">
                    {e.explanation}
                  </p>
                </details>
              ))}
            </div>
          </SoftCard>

          {/* 4. 背中ニキビとの関係 */}
          <SoftCard>
            <Eyebrow>背中ニキビとの関係</Eyebrow>
            <Paragraphs text={guide.relation_to_back_acne} />
          </SoftCard>

          {/* 5. 食材 */}
          <SoftCard>
            <Eyebrow>避けた方がよいもの / 食べてよいもの</Eyebrow>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-[#9c5f5f]">いまは控えめに</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {guide.avoid_foods.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-[#faf1f1] px-3.5 py-1.5 text-sm text-[#8a5a5a]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[#3c6347]">どうぞ楽しんで</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {guide.recommended_foods.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-[#eaf3ea] px-3.5 py-1.5 text-sm text-[#3c6347]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </SoftCard>

          {/* 6. 今週やること — THE standout */}
          <section className="rounded-3xl border-2 border-[#cfe3cf] bg-gradient-to-b from-[#f3f8f3] to-white p-5 shadow-sm sm:p-6">
            <Eyebrow>今週やること</Eyebrow>
            <p className="mb-4 text-sm leading-relaxed text-stone-500">
              7割できればOK。できない日があっても大丈夫です。
            </p>
            <ol className="space-y-3">
              {guide.weekly_actions.map((action, i) => (
                <li
                  key={action}
                  className="flex items-center gap-4 rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-[#e3ece3]"
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#5d8a6c] text-base font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-lg font-medium leading-snug text-stone-800">
                    {action}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* 7. 今日のチェック */}
          <SoftCard>
            <Eyebrow>今日のチェック</Eyebrow>
            <DailyCheckCard today={today} existing={todayCheck} onSubmit={handleCheckSubmit} />
          </SoftCard>

          {/* 8. 変化の記録 */}
          <SoftCard>
            <Eyebrow>変化の記録</Eyebrow>
            <ChangeRecordCard checks={checks} />
          </SoftCard>

          {/* 9. 次回カウンセリング */}
          <SoftCard>
            <Eyebrow>次回カウンセリングで話すこと</Eyebrow>
            <ul className="space-y-2.5">
              {guide.next_counseling_points.map((p) => (
                <li key={p} className="flex gap-2.5 text-base leading-relaxed text-stone-700">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#7da589]" />
                  {p}
                </li>
              ))}
            </ul>
          </SoftCard>

          {/* 今月の方針（フッタの前のひと呼吸） */}
          <SoftCard>
            <Eyebrow>今月の方針</Eyebrow>
            <Paragraphs text={guide.monthly_policy} />
          </SoftCard>

          {/* 10. フッタ */}
          <footer className="space-y-5 pb-4">
            <div className="rounded-3xl bg-[#eaf3ea] p-5 sm:p-6">
              <Paragraphs text={guide.encouraging_message} lead />
              <p className="mt-3 text-right text-sm text-[#587f63]">— なめらかせなか</p>
            </div>
            <div className="space-y-2 px-2 text-center text-xs leading-relaxed text-stone-400">
              <p>
                本ガイドは医療診断ではありません。検査・診断についてはエクシアクリニックにご相談ください。効果には個人差があります。
              </p>
              <p>
                サロン運営：なめらかせなか ／ 検査・医師コメント：エクシアクリニック ／
                開発・運営：バイタリティデザイン合同会社
              </p>
            </div>
          </footer>
        </>
      ) : (
        <SoftCard accent>
          <Eyebrow>ガイドを準備しています</Eyebrow>
          <p className="text-base leading-relaxed text-stone-600">
            あなた専用の回復ガイドは、ただいまサロンで作成中です。
            できあがったら、このページでご覧いただけます。少しだけお待ちくださいね。
          </p>
        </SoftCard>
      )}
    </Shell>
  );
}

// ---------- presentation helpers ----------

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-white via-[#f5f9f5] to-[#eef4ee]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-12 pt-8 sm:px-5">
        {children}
      </div>
    </div>
  );
}

function SoftCard({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <section
      className={
        accent
          ? "rounded-3xl border-2 border-[#cfe3cf] bg-white p-5 shadow-sm sm:p-6"
          : "rounded-3xl border border-[#e3ece3] bg-white/90 p-5 shadow-sm sm:p-6"
      }
    >
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-lg font-semibold leading-snug text-stone-800">{children}</h2>
  );
}

/** Splits \n\n paragraphs into airy text blocks — no dense walls of text. */
function Paragraphs({ text, lead = false }: { text: string; lead?: boolean }) {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className="space-y-3">
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className={
            lead
              ? "text-lg leading-relaxed text-stone-800"
              : "text-base leading-relaxed text-stone-600"
          }
        >
          {p}
        </p>
      ))}
    </div>
  );
}

function mergeChecks(
  base: DailyCheckRecord[],
  overrides: DailyCheckRecord[],
): DailyCheckRecord[] {
  const byDate = new Map(base.map((c) => [c.date, c]));
  for (const o of overrides) byDate.set(o.date, o);
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}
