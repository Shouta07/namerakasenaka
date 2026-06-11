"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useGuideCustomers } from "@/lib/guide/source";

/**
 * カルテ顧客詳細のヘッダエリアに出す小さなクロスリンク。
 * client_id 一致（デモでは名前一致もフォールバック）する回復ガイドが
 * あるときだけ表示する。
 */
export function RecoveryGuideChip({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName?: string;
}) {
  const guides = useGuideCustomers();
  const match =
    guides.find((g) => g.clientId === clientId) ??
    (clientName ? guides.find((g) => g.name === clientName) ?? null : null);

  if (!match) return null;

  return (
    <Link
      href={`/admin/customers/${match.id}`}
      className="inline-flex h-8 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
    >
      <Sparkles className="h-3 w-3" />
      回復ガイドを見る →
    </Link>
  );
}
