"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { CameraCapture } from "@/components/progress/camera-capture";
import { containsBannedWord } from "@/lib/compliance/banned-words";
import {
  addStoredCase,
  addStoredCaseTag,
  fileToResizedDataUrl,
  updateStoredCase,
} from "@/lib/demo/store";
import { useCaseTags, useCases } from "@/lib/cases/source";
import { demoOrganization } from "@/lib/demo/fixtures";
import {
  CONCERN_DURATION_OPTIONS,
  GENDER_LABEL,
  IMPROVEMENT_PERIOD_OPTIONS,
  SEVERITY_LABEL,
  type CaseGender,
  type CaseRecord,
  type CaseSeverity,
} from "@/lib/cases/types";
import { cn } from "@/lib/utils/cn";

export type CaseFormViewProps = {
  /** When set, edit mode. When null, create mode. */
  caseId: string | null;
  basePath: string;
};

type FormState = {
  anonymousId: string;
  age: string;
  gender: CaseGender | "";
  occupation: string;
  concernDuration: string;
  mainConcern: string;
  firstVisitDate: string;
  treatmentCount: string;
  improvementPeriod: string;
  severity: CaseSeverity;
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
  staffMemo: string;
  counselingComment: string;
  tagIds: string[];
};

const GENDERS: CaseGender[] = ["female", "male", "other", "no_answer"];
const SEVERITIES: CaseSeverity[] = ["light", "medium", "heavy"];

function suggestAnonymousId(existing: CaseRecord[]): string {
  const max = existing
    .map((c) => Number(c.anonymousId.replace(/[^0-9]/g, "")) || 0)
    .reduce((a, b) => Math.max(a, b), 0);
  return `C-${String(max + 1).padStart(4, "0")}`;
}

export function CaseFormView({ caseId, basePath }: CaseFormViewProps) {
  const router = useRouter();
  const cases = useCases();
  const tags = useCaseTags();
  const existing = caseId ? cases.find((c) => c.id === caseId) ?? null : null;

  const [form, setForm] = useState<FormState>(() => ({
    anonymousId: existing?.anonymousId ?? "",
    age: existing?.age != null ? String(existing.age) : "",
    gender: existing?.gender ?? "",
    occupation: existing?.occupation ?? "",
    concernDuration: existing?.concernDuration ?? "",
    mainConcern: existing?.mainConcern ?? "",
    firstVisitDate: existing?.firstVisitDate ?? "",
    treatmentCount: existing?.treatmentCount != null ? String(existing.treatmentCount) : "",
    improvementPeriod: existing?.improvementPeriod ?? "",
    severity: existing?.severity ?? "medium",
    beforeImageUrl: existing?.beforeImageUrl ?? null,
    afterImageUrl: existing?.afterImageUrl ?? null,
    staffMemo: existing?.staffMemo ?? "",
    counselingComment: existing?.counselingComment ?? "",
    tagIds: existing?.tagIds ?? [],
  }));
  const [submitting, setSubmitting] = useState(false);

  // Auto-suggest anonymous id once on mount if creating.
  useEffect(() => {
    if (!caseId && !form.anonymousId) {
      setForm((f) => ({ ...f, anonymousId: suggestAnonymousId(cases) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  function patch<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function toggleTag(id: string) {
    setForm((f) => ({
      ...f,
      tagIds: f.tagIds.includes(id)
        ? f.tagIds.filter((t) => t !== id)
        : [...f.tagIds, id],
    }));
  }

  function addInlineTag() {
    const name = window.prompt("追加するタグ名を入力");
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    if (tags.some((t) => t.name === trimmed)) {
      toast.error("同じ名前のタグが既にあります。");
      return;
    }
    const created = addStoredCaseTag({
      organizationId: demoOrganization.id,
      name: trimmed,
      sortOrder: 200,
    });
    setForm((f) => ({ ...f, tagIds: [...f.tagIds, created.id] }));
    toast.success(`タグ「${trimmed}」を追加しました`);
  }

  function onSubmit(asDraft: boolean) {
    if (!form.anonymousId.trim()) {
      toast.error("匿名 ID を入力してください。");
      return;
    }
    if (!form.mainConcern.trim()) {
      toast.error("主な悩みを入力してください。");
      return;
    }
    if (!form.counselingComment.trim()) {
      toast.error("カウンセリングコメントを入力してください。");
      return;
    }
    const banned1 = containsBannedWord(form.counselingComment);
    if (!banned1.ok) {
      toast.error(`カウンセリングコメントに使用できない表現があります: ${banned1.hits.join(", ")}`);
      return;
    }
    const banned2 = containsBannedWord(form.mainConcern);
    if (!banned2.ok) {
      toast.error(`主な悩みに使用できない表現があります: ${banned2.hits.join(", ")}`);
      return;
    }
    if (form.mainConcern.length > 200) {
      toast.error("主な悩みは 200 字以内で入力してください。");
      return;
    }

    if (asDraft) {
      toast.success("下書きとして保存しました（ローカル）。");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        organizationId: demoOrganization.id,
        anonymousId: form.anonymousId.trim(),
        age: form.age === "" ? null : Number(form.age),
        gender: (form.gender || null) as CaseGender | null,
        occupation: form.occupation.trim() || null,
        concernDuration: form.concernDuration || null,
        mainConcern: form.mainConcern.trim(),
        firstVisitDate: form.firstVisitDate || null,
        treatmentCount: form.treatmentCount === "" ? 0 : Number(form.treatmentCount),
        improvementPeriod: form.improvementPeriod || "未設定",
        severity: form.severity,
        beforeImageUrl: form.beforeImageUrl,
        afterImageUrl: form.afterImageUrl,
        staffMemo: form.staffMemo.trim() || null,
        counselingComment: form.counselingComment.trim(),
        tagIds: form.tagIds,
      };
      if (caseId) {
        updateStoredCase(caseId, payload);
        toast.success("症例を更新しました。");
        router.push(`${basePath}/${caseId}`);
      } else {
        const created = addStoredCase(payload);
        toast.success("症例を登録しました。");
        router.push(`${basePath}/${created.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-stone-900">
          {caseId ? "症例を編集" : "症例を登録"}
        </h1>
        <p className="mt-0.5 text-xs text-stone-500">
          基本情報・施術概要・タグ・画像・メモを入力します。
        </p>
      </header>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-sm font-semibold text-stone-900">基本情報</h2>
          <Field label="匿名 ID">
            <Input
              value={form.anonymousId}
              onChange={(e) => patch("anonymousId", e.target.value)}
              placeholder="C-0001"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="年齢">
              <Input
                type="number"
                min={0}
                value={form.age}
                onChange={(e) => patch("age", e.target.value)}
              />
            </Field>
            <Field label="性別">
              <Segmented
                value={form.gender}
                options={GENDERS.map((g) => ({ value: g, label: GENDER_LABEL[g] }))}
                onChange={(v) => patch("gender", v as CaseGender)}
              />
            </Field>
          </div>
          <Field label="職業">
            <Input
              value={form.occupation}
              onChange={(e) => patch("occupation", e.target.value)}
            />
          </Field>
          <Field label="悩みの期間">
            <Segmented
              value={form.concernDuration}
              options={CONCERN_DURATION_OPTIONS.map((d) => ({ value: d, label: d }))}
              onChange={(v) => patch("concernDuration", v)}
            />
          </Field>
          <Field label={`主な悩み（${form.mainConcern.length}/200）`}>
            <Textarea
              maxLength={200}
              value={form.mainConcern}
              onChange={(e) => patch("mainConcern", e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-sm font-semibold text-stone-900">施術概要</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="初回来店日">
              <Input
                type="date"
                value={form.firstVisitDate}
                onChange={(e) => patch("firstVisitDate", e.target.value)}
              />
            </Field>
            <Field label="施術回数">
              <Input
                type="number"
                min={0}
                value={form.treatmentCount}
                onChange={(e) => patch("treatmentCount", e.target.value)}
              />
            </Field>
          </div>
          <Field label="改善期間">
            <Segmented
              value={form.improvementPeriod}
              options={IMPROVEMENT_PERIOD_OPTIONS.map((d) => ({ value: d, label: d }))}
              onChange={(v) => patch("improvementPeriod", v)}
            />
          </Field>
          <Field label="重症度">
            <Segmented
              value={form.severity}
              options={SEVERITIES.map((s) => ({ value: s, label: SEVERITY_LABEL[s] }))}
              onChange={(v) => patch("severity", v as CaseSeverity)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">症状タグ</h2>
            <button
              type="button"
              onClick={addInlineTag}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-stone-200 px-2 text-xs text-stone-700"
            >
              <Plus className="h-3 w-3" />
              タグ追加
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => {
              const on = form.tagIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  className={cn(
                    "inline-flex min-h-[32px] items-center rounded-full border px-3 py-1 text-xs",
                    on
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-stone-200 bg-white text-stone-700",
                  )}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-sm font-semibold text-stone-900">Before / After 画像</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <ImageTile
              label="Before"
              value={form.beforeImageUrl}
              onChange={(v) => patch("beforeImageUrl", v)}
            />
            <ImageTile
              label="After"
              value={form.afterImageUrl}
              onChange={(v) => patch("afterImageUrl", v)}
            />
          </div>
          <p className="text-[11px] text-stone-500">
            画像未設定の場合は症例カードでプレースホルダーが表示されます。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-sm font-semibold text-stone-900">メモ</h2>
          <Field label="スタッフメモ（スタッフのみ）">
            <Textarea
              value={form.staffMemo}
              onChange={(e) => patch("staffMemo", e.target.value)}
              placeholder="施術上の運用メモ、生活背景など"
            />
          </Field>
          <Field label="カウンセリングコメント（カウンセリングで表示）">
            <Textarea
              value={form.counselingComment}
              onChange={(e) => patch("counselingComment", e.target.value)}
              placeholder="お客様にお見せする説明文（薬機法・健康増進法に配慮）"
            />
          </Field>
        </CardContent>
      </Card>

      <StickyActionBar>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onSubmit(true)}
            disabled={submitting}
          >
            下書き保存
          </Button>
          <Button
            type="button"
            onClick={() => onSubmit(false)}
            disabled={submitting}
            className="flex-1"
          >
            {caseId ? "更新する" : "登録する"}
          </Button>
        </div>
      </StickyActionBar>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex min-h-[44px] items-center rounded-lg border px-3 text-sm",
              on
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-stone-200 bg-white text-stone-700",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ImageTile({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const url = await fileToResizedDataUrl(file);
      onChange(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </Label>
      {value ? (
        <div className="overflow-hidden rounded-xl border border-stone-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="block aspect-[3/4] w-full object-cover" />
          <div className="flex items-center justify-between border-t border-stone-100 p-2">
            <span className="text-[10px] text-stone-500">{label} 設定済み</span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-xs text-stone-500 underline"
            >
              削除
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-3">
          <CameraCapture onCapture={handleFile} disabled={busy} />
          <div className="mt-2">
            <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-stone-200 bg-white px-3 text-xs text-stone-700">
              ファイルから選択
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
