"use client";

import { useState } from "react";
import { Leaf, Sparkles } from "lucide-react";
import {
  localDateString,
  useDailyChecksFor,
  useGuideCustomerByToken,
  useGuideMessagesFor,
  useHealthRecordFor,
  type DailyCheckRecord,
} from "@/lib/guide/source";
import { upsertStoredDailyCheck, newId } from "@/lib/demo/store";
import { safeParseRecoveryGuideJson } from "@/lib/guide/schema";
import { isDemoMode } from "@/lib/demo";
import { demoOrganization } from "@/lib/demo/fixtures";
import type { DailyCheckSubmit } from "./daily-check-card";
import { Eyebrow, GuideContent, SoftCard } from "./guide-content";

/**
 * /share/[token] — 顧客がスマホで開く「あなた専用の回復ガイド」。
 * 認証なし、URL を知る人だけが見られる。やさしく・清潔に・余白たっぷりに。
 * ガイド本文は GuideContent（/c/guide と共用）、ここは挨拶ヘッダと
 * 三社フッタを含むスタンドアロンの枠を担当する。
 */
export function ShareGuideView({ token }: { token: string }) {
  const customer = useGuideCustomerByToken(token);
  const healthRecord = useHealthRecordFor(customer?.id ?? null);
  const demoChecks = useDailyChecksFor(customer?.id ?? null);
  const companionMessages = useGuideMessagesFor(customer?.id ?? null);
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
            お手数ですが、{demoOrganization.shortName}までご連絡ください。
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
      {/* 挨拶ヘッダ */}
      <header className="px-1 pt-2 text-center">
        <p className="inline-flex items-center gap-1.5 text-sm font-medium tracking-wide text-[#587f63]">
          <Leaf className="h-4 w-4" aria-hidden />
          {demoOrganization.shortName}
          <Sparkles className="h-4 w-4" aria-hidden />
        </p>
        <h1 className="mt-2 text-2xl font-bold leading-snug text-stone-800">
          {customer.name}さんの回復ガイド
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-stone-500">
          提携クリニックの検査結果をもとに、{demoOrganization.shortName}
          が作成したあなた専用のガイドです
        </p>
      </header>

      {guide ? (
        <>
          <GuideContent
            guide={guide}
            today={today}
            todayCheck={todayCheck}
            checks={checks}
            onCheckSubmit={handleCheckSubmit}
            companionMessages={companionMessages}
            shareToken={token}
            guideCustomerId={customer.id}
          />

          {/* 三社フッタ */}
          <footer className="space-y-2 px-2 pb-4 text-center text-xs leading-relaxed text-stone-400">
            <p>
              本ガイドは医療診断ではありません。検査・診断については提携クリニックにご相談ください。効果には個人差があります。
            </p>
            <p>
              サロン運営：{demoOrganization.shortName} ／ 検査・医師コメント：提携クリニック ／
              開発・運営：バイタリティデザイン合同会社
            </p>
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

function mergeChecks(
  base: DailyCheckRecord[],
  overrides: DailyCheckRecord[],
): DailyCheckRecord[] {
  const byDate = new Map(base.map((c) => [c.date, c]));
  for (const o of overrides) byDate.set(o.date, o);
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}
