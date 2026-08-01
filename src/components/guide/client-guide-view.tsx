"use client";

import { Sparkles } from "lucide-react";
import {
  localDateString,
  useDailyChecksFor,
  useGuideCustomerByClientId,
  useGuideMessagesFor,
  useHealthRecordFor,
} from "@/lib/guide/source";
import { upsertStoredDailyCheck } from "@/lib/demo/store";
import { safeParseRecoveryGuideJson } from "@/lib/guide/schema";
import { isDemoMode } from "@/lib/demo";
import type { DailyCheckSubmit } from "./daily-check-card";
import { GuideContent } from "./guide-content";

/**
 * /c/guide — ログイン中の顧客のための回復ガイド。
 * /share/[token] と同じ GuideContent を、クライアントシェル
 * （RoleTopBar + ボトムナビ）の中で描画する。デイリーチェックは
 * 共有ページと同じデモストア（guide customer id キー）を共有する。
 */
export function ClientGuideView({ clientId }: { clientId: string | null }) {
  const customer = useGuideCustomerByClientId(clientId);
  const healthRecord = useHealthRecordFor(customer?.id ?? null);
  const checks = useDailyChecksFor(customer?.id ?? null);
  const companionMessages = useGuideMessagesFor(customer?.id ?? null);

  const guide = healthRecord?.aiSummaryJson
    ? safeParseRecoveryGuideJson(healthRecord.aiSummaryJson)
    : null;

  if (!customer || !guide) {
    return (
      <div className="mx-auto w-full max-w-md space-y-5">
        <CompactHeader generatedAt={null} />
        <div className="rounded-3xl border border-[#e3ece3] bg-[#fafcfa] p-6">
          <p className="text-base leading-relaxed text-stone-600">
            あなた専用の回復ガイドは、次回のカウンセリングでご案内します。
            検査やカウンセリングの内容をもとに、サロンが作成します。
          </p>
        </div>
      </div>
    );
  }

  const today = localDateString();
  const todayCheck = checks.find((c) => c.date === today) ?? null;

  async function handleCheckSubmit(input: DailyCheckSubmit): Promise<void> {
    if (!customer) return;
    // TODO(phase-1): 本番では Supabase（daily_checks）へ保存する。
    // 現在はデモストアのみ — /share/[token] と同じ namespace を共有。
    if (!isDemoMode()) return;
    upsertStoredDailyCheck({
      guideCustomerId: customer.id,
      date: input.date,
      actionDone: input.actionDone,
      actionLevel: input.actionLevel,
      skinCondition: input.skinCondition,
      bodyCondition: input.bodyCondition,
      memo: input.memo,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <CompactHeader generatedAt={healthRecord?.aiGeneratedAt ?? null} />
      <GuideContent
        guide={guide}
        today={today}
        todayCheck={todayCheck}
        checks={checks}
        onCheckSubmit={handleCheckSubmit}
        companionMessages={companionMessages}
        guideCustomerId={customer.id}
      />
      <p className="px-2 pb-2 text-center text-xs leading-relaxed text-stone-400">
        本ガイドは医療診断ではありません。検査・診断については提携クリニックにご相談ください。効果には個人差があります。
      </p>
    </div>
  );
}

function CompactHeader({ generatedAt }: { generatedAt: string | null }) {
  return (
    <header className="px-1 pt-1">
      <h1 className="flex items-center gap-2 text-xl font-bold text-stone-900">
        <Sparkles className="h-5 w-5 text-[#5d8a6c]" aria-hidden />
        あなたの回復ガイド
      </h1>
      {generatedAt ? (
        <p className="mt-1 text-xs text-stone-500">
          最終作成：
          {new Date(generatedAt).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      ) : null}
    </header>
  );
}
