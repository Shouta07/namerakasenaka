import Link from "next/link";
import type { ReactNode } from "react";

/**
 * 空の状態。
 *
 * 導入初日の店舗には、顧客も検査も練習履歴も無い。
 * 「データがありません」で終わらせず、必ず次の一歩を1つ置く —
 * 初日に手が止まると、そのまま使われなくなる。
 */
export function EmptyState({
  emoji,
  title,
  body,
  action,
  secondary,
  children,
}: {
  emoji: string;
  title: string;
  body: string;
  action?: { href: string; label: string };
  secondary?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
      <p className="text-3xl" aria-hidden>
        {emoji}
      </p>
      <p className="mt-3 text-[15px] font-bold text-stone-900">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-stone-600">
        {body}
      </p>
      {action || secondary ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {action ? (
            <Link
              href={action.href}
              className="inline-flex min-h-11 items-center rounded-full bg-brand-700 px-5 text-[13px] font-bold text-white transition hover:bg-brand-500"
            >
              {action.label}
            </Link>
          ) : null}
          {secondary ? (
            <Link
              href={secondary.href}
              className="inline-flex min-h-11 items-center rounded-full border border-stone-300 px-5 text-[13px] font-bold text-stone-700 transition hover:border-brand-500"
            >
              {secondary.label}
            </Link>
          ) : null}
        </div>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
