import { LabtestDemo } from "@/components/field-cx/labtest-demo";

export const metadata = {
  title: "血液検査の翻訳ガイド — 検査から継続伴走まで",
};

/**
 * /field-cx/labtest — 1枚の血液検査が6ヶ月の関係になるまでを、
 * 5ステップの実データで見せるデモ。ヒーロー機能（ai-guide）の実機画面。
 *
 * 画面全体が「初回 / 3ヶ月後」のタブで切り替わるため、本体はクライアント側。
 */
export default function FieldCxLabtestPage() {
  return <LabtestDemo />;
}
