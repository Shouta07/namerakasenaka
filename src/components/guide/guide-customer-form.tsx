"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { demoOrganization } from "@/lib/demo/fixtures";
import {
  addStoredGuideCustomer,
  addStoredHealthRecord,
  newId,
} from "@/lib/demo/store";

const formSchema = z.object({
  name: z.string().trim().min(1, "顧客名を入力してください").max(100),
  age: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) <= 130), {
      message: "年齢は数字で入力してください",
    }),
  concern: z.string().trim().min(1, "主な悩みを入力してください").max(500),
  testResultMemo: z.string().trim().max(8000),
  doctorComment: z.string().trim().max(8000),
  salonMemo: z.string().trim().max(8000),
  dietaryRestrictions: z.string().trim().max(4000),
  currentProblem: z.string().trim().max(4000),
});

type FormValues = z.infer<typeof formSchema>;

function newShareToken(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export function GuideCustomerForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      name: "",
      age: "",
      concern: "",
      testResultMemo: "",
      doctorComment: "",
      salonMemo: "",
      dietaryRestrictions: "",
      currentProblem: "",
    },
  });

  const onSubmit = handleSubmit((raw) => {
    const parsed = formSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "入力内容を確認してください");
      return;
    }
    const v = parsed.data;
    setSubmitting(true);
    try {
      const customer = addStoredGuideCustomer({
        organizationId: demoOrganization.id,
        clientId: null,
        name: v.name,
        age: v.age === "" ? null : Number(v.age),
        concern: v.concern,
        shareToken: newShareToken(),
      });
      addStoredHealthRecord({
        id: newId(),
        guideCustomerId: customer.id,
        testResultMemo: v.testResultMemo,
        doctorComment: v.doctorComment,
        salonMemo: v.salonMemo,
        dietaryRestrictions: v.dietaryRestrictions,
        currentProblem: v.currentProblem,
        aiSummaryJson: null,
        aiGeneratedAt: null,
      });
      toast.success("回復ガイドの発行先を登録しました");
      router.push(`/admin/customers/${customer.id}`);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-stone-900">回復ガイド発行先を登録</h1>
        <p className="mt-0.5 text-xs text-stone-500">
          クリニックの検査結果とサロンの所見を入力すると、AIがお客様向けガイドを作成できます。
        </p>
      </header>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-sm font-semibold text-stone-900">基本情報</h2>
          <Field label="顧客名">
            <Input {...register("name")} placeholder="例：田村 洋子" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="年齢">
              <Input {...register("age")} inputMode="numeric" placeholder="42" />
            </Field>
          </div>
          <Field label="主な悩み">
            <Textarea
              {...register("concern")}
              placeholder="例：背中ニキビ、肌荒れ、食事制限が続くか不安"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-sm font-semibold text-stone-900">クリニック情報</h2>
          <Field label="検査結果メモ" eyebrow="エクシアクリニックより">
            <Textarea
              {...register("testResultMemo")}
              rows={5}
              placeholder="IgGフードアレルギー / 腸内環境検査の結果メモ"
            />
          </Field>
          <Field label="医師コメント">
            <Textarea {...register("doctorComment")} rows={4} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-sm font-semibold text-stone-900">サロン情報</h2>
          <Field label="サロンメモ">
            <Textarea {...register("salonMemo")} rows={4} />
          </Field>
          <Field label="食事制限内容">
            <Textarea {...register("dietaryRestrictions")} rows={3} />
          </Field>
          <Field label="現在困っていること">
            <Textarea {...register("currentProblem")} rows={3} />
          </Field>
        </CardContent>
      </Card>

      <StickyActionBar>
        <Button type="submit" disabled={submitting} className="w-full">
          登録する
        </Button>
      </StickyActionBar>
    </form>
  );
}

function Field({
  label,
  eyebrow,
  children,
}: {
  label: string;
  eyebrow?: string;
  children: React.ReactNode;
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
      {children}
    </div>
  );
}
