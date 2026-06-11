export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ShareGuideView } from "@/components/guide/share-guide-view";

export const metadata: Metadata = {
  title: "あなた専用の回復ガイド | なめらかせなか",
  description:
    "エクシアクリニックの検査結果をもとに、なめらかせなかが作成したあなた専用の回復ガイドです。",
  robots: { index: false, follow: false },
};

/**
 * 顧客向け共有ページ — 認証なし、share_token を知る人だけが開ける。
 * スタンドアロンレイアウト（ロールナビなし）。デモはフィクスチャ +
 * localStorage、本番はトークン検証付き API（/api/daily-checks）で記録する。
 */
export default async function ShareGuidePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ShareGuideView token={token} />;
}
