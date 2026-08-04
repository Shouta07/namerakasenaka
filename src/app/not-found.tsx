import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-3xl" aria-hidden>
        🧭
      </p>
      <h1 className="mt-3 text-lg font-bold text-stone-900">
        このページは見つかりませんでした
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-stone-600">
        リンクが変わったか、公開が終了した可能性があります。
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/vitality-design"
          className="inline-flex min-h-11 items-center rounded-full bg-brand-700 px-5 text-[13px] font-bold text-white transition hover:bg-brand-500"
        >
          Vitality Design のトップへ
        </Link>
        <Link
          href="/hub"
          className="inline-flex min-h-11 items-center rounded-full border border-stone-300 px-5 text-[13px] font-bold text-stone-700 transition hover:border-brand-500"
        >
          すべての画面・資料
        </Link>
      </div>
    </div>
  );
}
