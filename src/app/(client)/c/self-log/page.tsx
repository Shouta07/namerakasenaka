"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { Textarea } from "@/components/ui/textarea";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/demo";
import { demoClient } from "@/lib/demo/fixtures";
import { addStoredSelfLog, useStoredSelfLogs } from "@/lib/demo/store";

type Score = 1 | 2 | 3 | 4 | 5;
const scores: Score[] = [1, 2, 3, 4, 5];

export default function SelfLogPage() {
  const router = useRouter();
  const [itch, setItch] = useState<Score>(3);
  const [redness, setRedness] = useState<Score>(3);
  const [newBreakout, setNewBreakout] = useState(false);
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const demo = isDemoMode();
  const stored = useStoredSelfLogs(demoClient.id);

  const history = useMemo(() => {
    return stored
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 20);
  }, [stored]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (demo) {
        addStoredSelfLog({
          clientId: demoClient.id,
          loggedOn: new Date().toISOString().slice(0, 10),
          itchScore: itch,
          rednessScore: redness,
          newBreakout,
          memo: memo || null,
        });
        toast.success("セルフログを記録しました");
        setMemo("");
        setNewBreakout(false);
        setItch(3);
        setRedness(3);
        return;
      }
      const supabase = getBrowserSupabase();
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setError("ログインが必要です");
        return;
      }
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", u.user.id)
        .maybeSingle();
      if (!client) {
        setError("顧客レコードが見つかりません");
        return;
      }
      const { error: insertError } = await supabase.from("self_logs").insert({
        client_id: (client as { id: string }).id,
        itch_score: itch,
        redness_score: redness,
        new_breakout: newBreakout,
        memo: memo || null,
      });
      if (insertError) {
        setError(insertError.message);
        return;
      }
      toast.success("セルフログを記録しました");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">セルフログ</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>今日のコンディション</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <ScoreRow label="痒み" value={itch} onChange={setItch} />
              <ScoreRow label="赤み" value={redness} onChange={setRedness} />
              <label className="flex min-h-11 items-center gap-3 text-base">
                <input
                  type="checkbox"
                  checked={newBreakout}
                  onChange={(e) => setNewBreakout(e.target.checked)}
                  className="h-5 w-5"
                />
                新規の吹き出物あり
              </label>
              <div className="space-y-1.5">
                <Label htmlFor="memo" className="text-base">メモ（任意）</Label>
                <Textarea
                  id="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="例: 昨日のメニューと睡眠時間など"
                />
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>
          </CardContent>
        </Card>
        <StickyActionBar>
          <Button type="submit" size="lg" className="w-full" disabled={saving}>
            {saving ? "保存中…" : "記録する"}
          </Button>
        </StickyActionBar>
      </form>

      {demo ? (
        <Card>
          <CardHeader>
            <CardTitle>これまでの記録（{history.length}件）</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-stone-500">
                まだ記録がありません。今日のコンディションを入力して保存してみてください。
              </p>
            ) : (
              <ul className="space-y-2">
                {history.map((h) => (
                  <li
                    key={h.id}
                    className="rounded-lg border border-stone-200 bg-white p-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-stone-900">
                        {new Date(h.createdAt).toLocaleString("ja-JP")}
                      </p>
                      <span className="text-stone-500">
                        痒み {h.itchScore}/5 ・ 赤み {h.rednessScore}/5
                      </span>
                    </div>
                    {h.newBreakout ? (
                      <p className="mt-1 text-amber-700">新規の吹き出物あり</p>
                    ) : null}
                    {h.memo ? (
                      <p className="mt-1 whitespace-pre-wrap text-stone-700">
                        {h.memo}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function ScoreRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Score;
  onChange: (s: Score) => void;
}) {
  return (
    <div>
      <Label className="mb-2 block text-base">
        {label} <span className="text-sm font-normal text-stone-500">({value}/5)</span>
      </Label>
      <div className="grid grid-cols-5 gap-2">
        {scores.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            aria-pressed={value === s}
            aria-label={`${label} ${s}`}
            className={`flex h-12 items-center justify-center rounded-xl border text-base font-semibold transition-colors ${
              value === s
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-stone-200 bg-white text-stone-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
