"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getBrowserSupabase } from "@/lib/supabase/client";

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
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
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">セルフログ</h1>
      <Card>
        <CardHeader>
          <CardTitle>今日のコンディション</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <ScoreRow label="痒み" value={itch} onChange={setItch} />
            <ScoreRow label="赤み" value={redness} onChange={setRedness} />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={newBreakout}
                onChange={(e) => setNewBreakout(e.target.checked)}
                className="h-4 w-4"
              />
              新規の吹き出物あり
            </label>
            <div className="space-y-1.5">
              <Label htmlFor="memo">メモ（任意）</Label>
              <Textarea id="memo" value={memo} onChange={(e) => setMemo(e.target.value)} />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" size="lg" className="w-full" disabled={saving}>
              記録する
            </Button>
          </form>
        </CardContent>
      </Card>
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
      <Label className="mb-2 block">
        {label} ({value}/5)
      </Label>
      <div className="flex gap-2">
        {scores.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`h-10 w-10 rounded-full border text-sm ${
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
