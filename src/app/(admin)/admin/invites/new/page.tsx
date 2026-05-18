"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isDemoMode } from "@/lib/demo";
import { addStoredInvite, newId } from "@/lib/demo/store";
import type { InviteTargetRole } from "@/types/domain";

export default function NewInvitePage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteTargetRole>("client");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const demo = isDemoMode();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setLink(null);
    try {
      if (demo) {
        const token = newId();
        addStoredInvite({ token, email, role, acceptedAt: null });
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        const url = `${origin}/invite/${token}`;
        setLink(url);
        toast.success("招待リンクを発行しました");
        return;
      }
      const res = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, targetRole: role }),
      });
      const j = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !j.url) {
        setError(j.error ?? "招待の作成に失敗しました");
        return;
      }
      setLink(j.url);
      toast.success("招待リンクを発行しました");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyToClipboard() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("リンクをコピーしました");
    } catch {
      toast.error("コピーに失敗しました");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">招待リンクの発行</h1>
      <Card>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">メールアドレス</Label>
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
              <Label>招待ロール</Label>
              <div className="flex gap-2">
                {(["client", "therapist"] as InviteTargetRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`min-h-11 flex-1 rounded-lg border px-3 py-2 text-sm ${
                      role === r
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-stone-200 bg-white text-stone-700"
                    }`}
                  >
                    {r === "client" ? "顧客" : "セラピスト"}
                  </button>
                ))}
              </div>
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              招待リンクを発行（72時間有効）
            </Button>
          </form>
          {link ? (
            <div className="mt-4 space-y-2 rounded-lg bg-emerald-50 p-3 text-sm">
              <p className="font-medium text-emerald-800">招待リンクを発行しました</p>
              <p className="break-all text-xs text-emerald-900">{link}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  リンクをコピー
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
