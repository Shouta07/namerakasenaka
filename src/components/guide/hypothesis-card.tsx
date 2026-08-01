"use client";

import Link from "next/link";
import {
  useGuideCustomerByClientId,
  useHealthRecordFor,
} from "@/lib/guide/source";
import { safeParseRecoveryGuideJson } from "@/lib/guide/schema";

/**
 * /c/progress 冒頭の「いま、身体で起きていること」カード。
 * 回復ガイドの today_summary の最初の一文を抜粋し、/c/guide へ誘導する。
 * ガイドが存在しない顧客では何も描画しない（静かにスキップ）。
 */
export function HypothesisCard({ clientId }: { clientId: string }) {
  const customer = useGuideCustomerByClientId(clientId);
  const healthRecord = useHealthRecordFor(customer?.id ?? null);

  const guide = healthRecord?.aiSummaryJson
    ? safeParseRecoveryGuideJson(healthRecord.aiSummaryJson)
    : null;
  if (!guide) return null;

  const excerpt = firstSentence(guide.today_summary, 80);
  if (!excerpt) return null;

  return (
    <section className="rounded-2xl border border-[#cfe3cf] bg-[#f3f8f3] p-4 shadow-sm sm:p-5">
      <p className="text-xs font-semibold tracking-wide text-[#587f63]">
        あなたの身体で起きていること
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-stone-700">{excerpt}</p>
      <Link
        href="/c/guide"
        className="inline-flex min-h-11 items-center mt-2 inline-block text-sm font-medium text-[#3c6347] underline underline-offset-2 hover:text-[#587f63]"
      >
        くわしく見る →
      </Link>
    </section>
  );
}

/** 最初の一文（「。」まで）を取り出し、maxChars でやさしく切り詰める。 */
function firstSentence(text: string, maxChars: number): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const endIndex = trimmed.indexOf("。");
  const sentence = endIndex >= 0 ? trimmed.slice(0, endIndex + 1) : trimmed;
  if (sentence.length <= maxChars) return sentence;
  return `${sentence.slice(0, maxChars)}…`;
}
