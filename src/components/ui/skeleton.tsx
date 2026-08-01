import { cn } from "@/lib/utils/cn";

/** 読み込み中の骨組み。動きは prefers-reduced-motion で止まる（globals.css）。 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-xl bg-stone-100", className)}
    />
  );
}

/** カード一覧の読み込み表示。件数は呼び出し側の見た目に合わせる。 */
export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-stone-200 bg-white p-5">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-4/5" />
          <Skeleton className="mt-4 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

/** ページ全体の読み込み表示。 */
export function SkeletonPage() {
  return (
    <div className="space-y-6" role="status" aria-label="読み込み中">
      <div>
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-3 h-7 w-2/3 max-w-md" />
        <Skeleton className="mt-3 h-3 w-full max-w-xl" />
      </div>
      <SkeletonCards />
      <span className="sr-only">読み込み中です</span>
    </div>
  );
}
