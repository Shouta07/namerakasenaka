"use client";

import Link from "next/link";
import { Copy, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGuideCustomers, useHealthRecords } from "@/lib/guide/source";
import { relativeTimeJa } from "@/lib/demo/time";

export function copyShareUrl(shareToken: string): void {
  const url = `${window.location.origin}/share/${shareToken}`;
  void navigator.clipboard
    .writeText(url)
    .then(() => toast.success("共有URLをコピーしました"))
    .catch(() => toast.error("コピーできませんでした"));
}

export function AdminGuideCustomersList() {
  const customers = useGuideCustomers();
  const records = useHealthRecords();

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">回復ガイド</h1>
          <p className="mt-1 text-xs leading-relaxed text-stone-500">
            カルテ顧客とは別に、回復ガイドの発行先を管理します。
            カルテは{" "}
            <Link href="/admin/clients" className="text-brand-700 underline">
              顧客一覧
            </Link>{" "}
            へ。
          </p>
        </div>
        <Link href="/admin/customers/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            新規発行
          </Button>
        </Link>
      </header>

      <div className="space-y-3">
        {customers.map((c) => {
          const record = records
            .filter((r) => r.guideCustomerId === c.id)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
          const generated = Boolean(record?.aiSummaryJson);
          return (
            <Card key={c.id}>
              <CardContent className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-stone-900">
                      {c.name}
                      {c.age != null ? (
                        <span className="ml-1.5 text-xs font-normal text-stone-500">
                          {c.age}歳
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-stone-600">{c.concern}</p>
                  </div>
                  {generated ? (
                    <Badge tone="success" className="flex-none">
                      <Sparkles className="mr-1 h-3 w-3" />
                      ガイド生成済み
                    </Badge>
                  ) : (
                    <Badge tone="neutral" className="flex-none">
                      未生成
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-stone-400">
                  作成 {relativeTimeJa(c.createdAt)}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyShareUrl(c.shareToken)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-xs font-medium text-stone-700 hover:bg-stone-50"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    共有URLコピー
                  </button>
                  <Link
                    href={`/admin/customers/${c.id}`}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-brand-50 px-3 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                  >
                    詳細
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {customers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-stone-500">
              まだ回復ガイドの発行先がありません。「新規発行」から登録してください。
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
