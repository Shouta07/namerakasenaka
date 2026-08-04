import type { Metadata } from "next";
import { TrialStart } from "@/components/trial/trial-start";

export const metadata: Metadata = {
  title: "お試し | Vitality Design",
  description:
    "登録なしで、検査結果の取り込みから患者さんの画面までを3分で確認いただけます。",
};

/**
 * /trial — 資料請求をいただいた方にお送りするリンクの着地点。
 *
 * ここで相手に何も要求しない。登録も設定もなく、開いたら触れる。
 * 「何ができるか」より先に「データがどう扱われるか」を書く —
 * 検査結果を扱う商品では、そこが最初の関門なので。
 */
export default function TrialPage() {
  return <TrialStart />;
}
