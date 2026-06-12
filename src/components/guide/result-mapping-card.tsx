"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import type { ResultMapping } from "@/lib/guide/schema";
import { cn } from "@/lib/utils/cn";
import { Eyebrow, SoftCard } from "./guide-content";

/**
 * 「あなたの結果とつながり」— 検査結果 → 身体の状態 → 行動 を1行ずつ
 * 視覚的につなぐカード。納得感（自分の結果だからやる意味がある）の核。
 *
 * モバイル(375px): 縦積み3段 + 下向き矢印。sm以上: 横3カラムのフロー。
 */
export function ResultMappingCard({ mappings }: { mappings: ResultMapping[] }) {
  if (mappings.length === 0) return null;
  return (
    <SoftCard>
      <Eyebrow>あなたの結果とつながり</Eyebrow>
      <p className="mb-4 text-sm leading-relaxed text-stone-500">
        検査でわかったことが、毎日の行動にどうつながっているかのマップです。
      </p>
      <ul className="space-y-5">
        {mappings.map((m, i) => (
          <li
            key={m.finding}
            className={cn(
              "flex flex-col gap-1 sm:grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-stretch sm:gap-1.5",
              i > 0 && "border-t border-dashed border-[#e3ece3] pt-5",
            )}
          >
            <Stage tone="beige" label="検査でわかったこと" text={m.finding} />
            <FlowArrow />
            <Stage tone="pale" label="からだで起きていること" text={m.meaning} />
            <FlowArrow />
            <Stage tone="brand" label="ためしてみること" text={m.action} />
          </li>
        ))}
      </ul>
      <p className="mt-5 text-xs leading-relaxed text-stone-400">
        検査の見方について詳しくは、次回のカウンセリングでもご説明します
      </p>
    </SoftCard>
  );
}

function FlowArrow() {
  return (
    <span aria-hidden className="flex items-center justify-center text-[#9dc0a8]">
      <ChevronDown className="h-4 w-4 sm:hidden" />
      <ChevronRight className="hidden h-4 w-4 sm:block" />
    </span>
  );
}

const STAGE_STYLES = {
  beige: {
    box: "bg-[#f8f3e8] text-stone-700",
    label: "text-[#a3845a]",
  },
  pale: {
    box: "bg-[#eef5ee] text-stone-700",
    label: "text-[#6f9a7d]",
  },
  brand: {
    box: "bg-[#5d8a6c] text-white shadow-sm",
    label: "text-[#d7e7dc]",
  },
} as const;

function Stage({
  tone,
  label,
  text,
}: {
  tone: keyof typeof STAGE_STYLES;
  label: string;
  text: string;
}) {
  const s = STAGE_STYLES[tone];
  return (
    <div className={cn("rounded-2xl px-4 py-3", s.box)}>
      <p className={cn("text-[11px] font-semibold tracking-wide", s.label)}>{label}</p>
      <p
        className={cn(
          "mt-1 text-sm leading-relaxed",
          tone === "brand" && "font-medium",
        )}
      >
        {text}
      </p>
    </div>
  );
}
