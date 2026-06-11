"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, ExternalLink, Loader2, Pencil, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useGuideCustomer,
  useHealthRecordFor,
  type HealthRecordRecord,
} from "@/lib/guide/source";
import { addStoredHealthRecord, newId } from "@/lib/demo/store";
import type { RecoveryGuideJson } from "@/lib/guide/schema";
import { copyShareUrl } from "./admin-customers-list";

type RecordDraft = {
  testResultMemo: string;
  doctorComment: string;
  salonMemo: string;
  dietaryRestrictions: string;
  currentProblem: string;
};

function toDraft(record: HealthRecordRecord | null): RecordDraft {
  return {
    testResultMemo: record?.testResultMemo ?? "",
    doctorComment: record?.doctorComment ?? "",
    salonMemo: record?.salonMemo ?? "",
    dietaryRestrictions: record?.dietaryRestrictions ?? "",
    currentProblem: record?.currentProblem ?? "",
  };
}

export function GuideCustomerDetail({ guideCustomerId }: { guideCustomerId: string }) {
  const customer = useGuideCustomer(guideCustomerId);
  const record = useHealthRecordFor(customer?.id ?? null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<RecordDraft | null>(null);
  const [generating, setGenerating] = useState(false);

  if (!customer) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-stone-500">
          発行先が見つかりませんでした。
          <Link href="/admin/customers" className="ml-1 text-brand-700 underline">
            一覧へ戻る
          </Link>
        </CardContent>
      </Card>
    );
  }

  const guide = record?.aiSummaryJson ?? null;

  function persistRecord(patch: Partial<HealthRecordRecord>): void {
    if (!customer) return;
    addStoredHealthRecord({
      id: record?.id ?? newId(),
      guideCustomerId: customer.id,
      testResultMemo: record?.testResultMemo ?? "",
      doctorComment: record?.doctorComment ?? "",
      salonMemo: record?.salonMemo ?? "",
      dietaryRestrictions: record?.dietaryRestrictions ?? "",
      currentProblem: record?.currentProblem ?? "",
      aiSummaryJson: record?.aiSummaryJson ?? null,
      aiGeneratedAt: record?.aiGeneratedAt ?? null,
      createdAt: record?.createdAt,
      ...patch,
    });
  }

  function saveDraft(): void {
    if (!draft) return;
    persistRecord(draft);
    setEditing(false);
    setDraft(null);
    toast.success("健康記録を保存しました");
  }

  async function generate(): Promise<void> {
    if (!customer) return;
    setGenerating(true);
    try {
      const source = draft ?? toDraft(record);
      const res = await fetch("/api/recovery-guide/preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: customer.name,
          age: customer.age,
          concern: customer.concern,
          ...source,
        }),
      });
      const json = (await res.json()) as {
        guide?: RecoveryGuideJson;
        generatedAt?: string;
        message?: string;
      };
      if (!res.ok || !json.guide) {
        toast.error(json.message ?? "生成に失敗しました。もう一度お試しください。");
        return;
      }
      persistRecord({
        aiSummaryJson: json.guide,
        aiGeneratedAt: json.generatedAt ?? new Date().toISOString(),
      });
      toast.success("回復ガイドを生成しました");
    } catch {
      toast.error("生成に失敗しました。通信環境を確認して、もう一度お試しください。");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* 顧客情報 */}
      <Card>
        <CardContent className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-xl font-semibold text-stone-900">{customer.name}</h1>
              <p className="mt-0.5 text-xs text-stone-500">
                {customer.age != null ? `${customer.age}歳 ・ ` : ""}
                発行日 {new Date(customer.createdAt).toLocaleDateString("ja-JP")}
              </p>
            </div>
            {guide ? (
              <Badge tone="success">
                <Sparkles className="mr-1 h-3 w-3" />
                ガイド生成済み
              </Badge>
            ) : (
              <Badge tone="neutral">未生成</Badge>
            )}
          </div>
          <p className="text-sm leading-relaxed text-stone-700">{customer.concern}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => copyShareUrl(customer.shareToken)}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              <Copy className="h-3.5 w-3.5" />
              共有URLをコピー
            </button>
            <Link
              href={`/share/${customer.shareToken}`}
              target="_blank"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              顧客ページをプレビュー
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 健康記録 */}
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">健康記録</h2>
            {!editing ? (
              <button
                type="button"
                onClick={() => {
                  setDraft(toDraft(record));
                  setEditing(true);
                }}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-stone-200 px-2 text-xs text-stone-700"
              >
                <Pencil className="h-3 w-3" />
                編集
              </button>
            ) : null}
          </div>

          {editing && draft ? (
            <div className="space-y-3">
              <EditField
                label="検査結果メモ"
                eyebrow="エクシアクリニックより"
                value={draft.testResultMemo}
                onChange={(v) => setDraft({ ...draft, testResultMemo: v })}
              />
              <EditField
                label="医師コメント"
                value={draft.doctorComment}
                onChange={(v) => setDraft({ ...draft, doctorComment: v })}
              />
              <EditField
                label="サロンメモ"
                value={draft.salonMemo}
                onChange={(v) => setDraft({ ...draft, salonMemo: v })}
              />
              <EditField
                label="食事制限内容"
                value={draft.dietaryRestrictions}
                onChange={(v) => setDraft({ ...draft, dietaryRestrictions: v })}
              />
              <EditField
                label="現在困っていること"
                value={draft.currentProblem}
                onChange={(v) => setDraft({ ...draft, currentProblem: v })}
              />
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={saveDraft}>
                  保存
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(false);
                    setDraft(null);
                  }}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          ) : (
            <dl className="space-y-3">
              <ReadField
                label="検査結果メモ"
                eyebrow="エクシアクリニックより"
                value={record?.testResultMemo}
              />
              <ReadField label="医師コメント" value={record?.doctorComment} />
              <ReadField label="サロンメモ" value={record?.salonMemo} />
              <ReadField label="食事制限内容" value={record?.dietaryRestrictions} />
              <ReadField label="現在困っていること" value={record?.currentProblem} />
            </dl>
          )}
        </CardContent>
      </Card>

      {/* AI 生成 */}
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">回復ガイド</h2>
            {record?.aiGeneratedAt ? (
              <p className="text-[11px] text-stone-400">
                生成 {new Date(record.aiGeneratedAt).toLocaleString("ja-JP")}
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            onClick={() => void generate()}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                ガイドを作成しています…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {guide ? "再生成" : "AIでガイドを生成"}
              </>
            )}
          </Button>
          <p className="text-[11px] leading-relaxed text-stone-400">
            生成結果は §8.2 禁止語フィルタ + 回復ガイド追加禁止表現を自動チェックします。
            チェックに引っかかった場合はもう一度生成してください。
          </p>

          {guide ? <GuidePreview guide={guide} /> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function GuidePreview({ guide }: { guide: RecoveryGuideJson }) {
  return (
    <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700">
          今日のまとめ
        </p>
        <p className="mt-1 text-sm leading-relaxed text-stone-700">{guide.today_summary}</p>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700">
          今週やること（3つ）
        </p>
        <ol className="mt-1 space-y-1">
          {guide.weekly_actions.map((a, i) => (
            <li key={a} className="text-sm text-stone-700">
              {i + 1}. {a}
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-500">
        <span>やさしい解説 {guide.easy_explanations.length}語</span>
        <span>控える食材 {guide.avoid_foods.length}件</span>
        <span>おすすめ食材 {guide.recommended_foods.length}件</span>
        <span>次回カウンセリング {guide.next_counseling_points.length}項目</span>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700">
          応援メッセージ
        </p>
        <p className="mt-1 text-sm leading-relaxed text-stone-700">
          {guide.encouraging_message}
        </p>
      </div>
    </div>
  );
}

function ReadField({
  label,
  eyebrow,
  value,
}: {
  label: string;
  eyebrow?: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      {eyebrow ? (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700">
          {eyebrow}
        </p>
      ) : null}
      <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
        {value?.trim() ? value : <span className="text-stone-400">（未記入）</span>}
      </dd>
    </div>
  );
}

function EditField({
  label,
  eyebrow,
  value,
  onChange,
}: {
  label: string;
  eyebrow?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      {eyebrow ? (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700">
          {eyebrow}
        </p>
      ) : null}
      <Label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} />
    </div>
  );
}
