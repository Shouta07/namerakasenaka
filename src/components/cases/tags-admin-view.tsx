"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { useCaseTags, useCases } from "@/lib/cases/source";
import {
  addStoredCaseTag,
  removeStoredCaseTag,
  updateStoredCaseTag,
} from "@/lib/demo/store";
import { demoOrganization } from "@/lib/demo/fixtures";

export function TagsAdminView() {
  const tags = useCaseTags();
  const cases = useCases();
  const usageById = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of cases) {
      for (const id of c.tagIds) map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }, [cases]);

  const [newName, setNewName] = useState("");
  const [newOrder, setNewOrder] = useState("200");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function add() {
    if (!newName.trim()) {
      toast.error("タグ名を入力してください。");
      return;
    }
    if (tags.some((t) => t.name === newName.trim())) {
      toast.error("同じ名前のタグが既にあります。");
      return;
    }
    addStoredCaseTag({
      organizationId: demoOrganization.id,
      name: newName.trim(),
      sortOrder: Number(newOrder) || 200,
    });
    setNewName("");
    toast.success("タグを追加しました。");
  }

  function commitOrder(id: string, sortOrder: number) {
    updateStoredCaseTag(id, { sortOrder });
  }

  function del(id: string) {
    removeStoredCaseTag(id);
    toast.success("タグを削除しました。");
    setConfirmId(null);
  }

  const confirmTag = confirmId ? tags.find((t) => t.id === confirmId) ?? null : null;
  const confirmUsage = confirmId ? usageById.get(confirmId) ?? 0 : 0;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-stone-900">タグ管理</h1>
        <p className="mt-0.5 text-xs text-stone-500">
          症例カードで使用するタグの追加・並べ替え・削除を行います。
        </p>
      </header>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-sm font-semibold text-stone-900">新規タグを追加</h2>
          <div className="grid gap-2 sm:grid-cols-[1fr_140px_auto]">
            <div>
              <Label className="text-xs text-stone-500">名前</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="炎症ニキビ など"
              />
            </div>
            <div>
              <Label className="text-xs text-stone-500">並び順</Label>
              <Input
                type="number"
                value={newOrder}
                onChange={(e) => setNewOrder(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={add}>
                追加
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-sm font-semibold text-stone-900">既存のタグ</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-xs text-stone-500">
                <tr>
                  <th className="px-3 py-2 text-left">名前</th>
                  <th className="px-3 py-2 text-right">使用件数</th>
                  <th className="px-3 py-2 text-right">並び順</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {tags.map((t) => {
                  const usage = usageById.get(t.id) ?? 0;
                  return (
                    <tr key={t.id} className="border-t border-stone-100">
                      <td className="px-3 py-2 text-stone-800">{t.name}</td>
                      <td className="px-3 py-2 text-right text-stone-700">{usage}</td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          defaultValue={t.sortOrder}
                          onBlur={(e) =>
                            commitOrder(t.id, Number(e.target.value) || 0)
                          }
                          className="h-9 w-20 rounded-md border border-stone-200 px-2 text-right text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setConfirmId(t.id)}
                          className="inline-flex h-9 items-center gap-1 rounded-md border border-stone-200 px-2 text-xs text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                          削除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(confirmId)} onClose={() => setConfirmId(null)}>
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-stone-900">タグを削除しますか？</h2>
          <p className="text-sm text-stone-700">
            「{confirmTag?.name}」を削除します。
            {confirmUsage > 0 ? (
              <>
                <br />
                <span className="text-amber-700">
                  現在 {confirmUsage} 件の症例で使用されています。
                </span>
              </>
            ) : null}
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmId(null)}>
              キャンセル
            </Button>
            <Button variant="danger" onClick={() => confirmId && del(confirmId)}>
              削除する
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
