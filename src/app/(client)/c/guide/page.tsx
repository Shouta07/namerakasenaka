export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { isDemoMode } from "@/lib/demo";
import { demoClient, demoOrganization } from "@/lib/demo/fixtures";
import { ClientGuideView } from "@/components/guide/client-guide-view";

export const metadata: Metadata = {
  title: `回復ガイド | ${demoOrganization.shortName}`,
};

/**
 * /c/guide — クライアントエリア内の回復ガイド。
 * /share/[token] と同じガイド本文（GuideContent）を、ログイン顧客向けに
 * クライアントレイアウトの中で表示する。
 */
export default function ClientGuidePage() {
  // TODO(phase-1): 本番では Supabase の guide_customers を
  // client_id = ログインユーザーの client id で照会して解決する。
  // 現在はデモ顧客（client-yamada）→ ガイド顧客（田村洋子）の紐付けで動作する。
  const clientId = isDemoMode() ? demoClient.id : null;
  return <ClientGuideView clientId={clientId} />;
}
