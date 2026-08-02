import type { Metadata } from "next";
import { demoOrganization } from "@/lib/demo/fixtures";
import { LineConnectPanel } from "@/components/line/line-connect-panel";

export const metadata: Metadata = {
  title: `公式LINEの連携 | ${demoOrganization.shortName}`,
};

/**
 * /admin/settings/line — 店舗が自分の公式LINEを接続する画面。
 *
 * 当社が代行入力しない設計なので、この画面は店舗の管理者にだけ開く。
 * TODO(phase-1): 本番ではログイン中のユーザーの organization_id と
 * salon_admin ロールを見て、それ以外には出さない。
 */
export default function LineSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <header>
        <h1 className="text-xl font-bold text-stone-900">公式LINEの連携</h1>
        <p className="mt-1 text-[12.5px] leading-relaxed text-stone-600">
          貴店の LINE 公式アカウントとつなぐと、経過のご案内を
          貴店のアカウントからお送りできるようになります。
        </p>
      </header>

      <LineConnectPanel
        organizationId={demoOrganization.id}
        operatorName="店舗管理者"
      />
    </div>
  );
}
