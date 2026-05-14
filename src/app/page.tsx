import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12">
      <p className="text-sm font-medium text-brand-700">Senacare</p>
      <h1 className="mt-2 text-4xl font-bold leading-tight text-stone-900">
        来店と来店の「間」を、サロンの強みに。
      </h1>
      <p className="mt-4 text-base text-stone-600">
        高単価背中ケア専門サロンのための、進捗写真・施術カルテ・予約・Q&A
        を一元化する顧客管理プラットフォームです。
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/login">
          <Button size="lg">ログイン</Button>
        </Link>
        <a
          href="https://github.com/"
          className="inline-flex h-14 items-center px-2 text-sm text-stone-500 hover:text-stone-700"
        >
          ドキュメントを見る
        </a>
      </div>
      <p className="mt-12 text-xs text-stone-400">
        ご利用にはサロン管理者からの招待リンクが必要です。
      </p>
    </main>
  );
}
