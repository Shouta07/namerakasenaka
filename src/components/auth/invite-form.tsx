"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isDemoMode } from "@/lib/demo";
import {
  findStoredInviteByToken,
  markStoredInviteAccepted,
  type StoredInvite,
} from "@/lib/demo/store";
import { ROLE_HOME_PATH } from "@/types/domain";

export function InviteAcceptForm({ token }: { token: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [invite, setInvite] = useState<StoredInvite | null>(null);
  const demo = isDemoMode();

  useEffect(() => {
    if (demo) {
      setInvite(findStoredInviteByToken(token));
    }
  }, [demo, token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (demo) {
        markStoredInviteAccepted(token);
        const dest = invite ? ROLE_HOME_PATH[invite.role] ?? "/" : "/";
        toast.success("受諾しました（サンプル）");
        setTimeout(() => router.push(dest), 500);
        return;
      }
      const res = await fetch("/api/auth/invite/accept", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "招待の受諾に失敗しました");
        return;
      }
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {demo && invite ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          サンプル招待: {invite.email}（{invite.role === "client" ? "顧客" : "セラピスト"}）
        </p>
      ) : null}
      {demo && !invite ? (
        <p className="rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600">
          サンプル招待リンクです。下のフォームを送信すると受諾され、ロールに応じた画面に移動します。
        </p>
      ) : null}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-base">氏名</Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          autoCapitalize="words"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-base">
          パスワード（8文字以上、英数字混在）
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        登録する
      </Button>
    </form>
  );
}
