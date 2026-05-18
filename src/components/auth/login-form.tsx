"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBrowserSupabase } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const redirectTo = search.get("redirectTo") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  async function onPasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function onMagicLink() {
    setError(null);
    if (!email) {
      setError("メールアドレスを入力してください");
      return;
    }
    setLoading(true);
    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}${redirectTo}` },
      });
      if (error) setError(error.message);
      else setMagicSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onPasswordLogin} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-base">メールアドレス</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-base">パスワード</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {magicSent ? (
        <p className="text-sm text-emerald-700">マジックリンクをメールで送信しました。</p>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        ログイン
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={onMagicLink}
        disabled={loading}
      >
        メールでログインリンクを受け取る
      </Button>
    </form>
  );
}
