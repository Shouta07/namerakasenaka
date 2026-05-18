import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6"
      style={{
        paddingTop: "max(var(--safe-top), 24px)",
        paddingBottom: "max(var(--safe-bottom), 24px)",
      }}
    >
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 self-start text-xs text-stone-500 hover:text-stone-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        トップに戻る
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
          <p className="mt-6 text-xs text-stone-500">
            アカウントをお持ちでない方は、サロン管理者から届いた招待リンクをご利用ください。
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
