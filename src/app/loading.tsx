import { SkeletonPage } from "@/components/ui/skeleton";

/** 全ルート共通の読み込み表示。白画面のまま待たせない。 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
      <SkeletonPage />
    </div>
  );
}
