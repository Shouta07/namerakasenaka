"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * 画面のどこかで失敗したときに、必ずここに落ちる。
 *
 * サロンのWi-Fiは弱く、失敗はお客様の目の前で起きる。
 * 原因の技術的な説明ではなく「いま何をすればいいか」だけを出す。
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 本番では監視サービスへ送る。デモではコンソールに残すだけ。
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-3xl" aria-hidden>
        🌧
      </p>
      <h1 className="mt-3 text-lg font-bold text-stone-900">
        うまく表示できませんでした
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-stone-600">
        通信が不安定なときに起こることがあります。
        もう一度読み込んでみてください。入力途中の内容は、この端末に残っています。
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center rounded-full bg-brand-700 px-5 text-[13px] font-bold text-white transition hover:bg-brand-500"
        >
          もう一度読み込む
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full border border-stone-300 px-5 text-[13px] font-bold text-stone-700 transition hover:border-brand-500"
        >
          トップに戻る
        </Link>
      </div>
      {error.digest ? (
        <p className="mt-4 text-[11px] text-stone-400">
          サポートに伝える番号：{error.digest}
        </p>
      ) : null}
    </div>
  );
}
