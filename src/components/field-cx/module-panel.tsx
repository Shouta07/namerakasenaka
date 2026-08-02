"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { FIELD_CX_MODULES, type FieldCxModuleId } from "@/lib/field-cx/fixtures";
import { getModuleState, setModuleEnabled } from "@/lib/field-cx/store";

/**
 * 機能モジュールの増減パネル。
 * Field CX のコンセプト「必要な機能だけ、必要なときに」をそのまま UI にする。
 */
/**
 * @param compact 設定パネル用の1列表示。カード並べではなく行に畳む。
 */
export function ModulePanel({ compact = false }: { compact?: boolean } = {}) {
  const [modules, setModules] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    const sync = () => setModules({ ...getModuleState() });
    sync();
    window.addEventListener("field-cx-store", sync);
    return () => window.removeEventListener("field-cx-store", sync);
  }, []);

  function toggle(id: FieldCxModuleId, name: string, next: boolean) {
    setModuleEnabled(id, next);
    toast(next ? `「${name}」をオンにしました` : `「${name}」をオフにしました`);
  }

  if (compact) {
    return (
      <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
        {FIELD_CX_MODULES.map((m) => {
          const enabled = modules ? modules[m.id] !== false : true;
          return (
            <li key={m.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-lg" aria-hidden>
                {m.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold text-stone-900">
                  {m.name}
                </span>
                <span className="block text-[11px] text-stone-500">{m.short}</span>
              </span>
              {m.core ? (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                  コア
                </span>
              ) : (
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`${m.name} を${enabled ? "オフ" : "オン"}にする`}
                  onClick={() => toggle(m.id, m.short, !enabled)}
                  className={cn(
                    "relative h-6 w-11 flex-none rounded-full transition-colors",
                    "after:absolute after:-inset-2.5 after:content-['']",
                    enabled ? "bg-brand-700" : "bg-stone-300",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                      enabled ? "left-[22px]" : "left-0.5",
                    )}
                  />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {FIELD_CX_MODULES.map((m) => {
        const enabled = modules ? modules[m.id] !== false : true;
        return (
          <div
            key={m.id}
            className={cn(
              "flex flex-col rounded-2xl border p-4 transition-colors",
              enabled
                ? "border-stone-200 bg-white"
                : "border-dashed border-stone-300 bg-stone-50 opacity-70",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden>
                  {m.emoji}
                </span>
                <p className="text-[14px] font-bold text-stone-900">{m.name}</p>
              </div>
              {m.core ? (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                  コア
                </span>
              ) : (
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`${m.name} を${enabled ? "オフ" : "オン"}にする`}
                  onClick={() => toggle(m.id, m.short, !enabled)}
                  className={cn(
                    // 見た目は24pxのまま、当たり判定だけ44px相当に広げる。
                    "relative h-6 w-11 flex-none rounded-full transition-colors",
                    "after:absolute after:-inset-2.5 after:content-['']",
                    enabled ? "bg-brand-700" : "bg-stone-300",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                      enabled ? "left-[22px]" : "left-0.5",
                    )}
                  />
                </button>
              )}
            </div>
            <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-stone-600">
              {m.description}
            </p>
            {m.href && enabled ? (
              <Link
                href={m.href}
                className="mt-1 inline-flex min-h-11 items-center text-[12px] font-semibold text-brand-700 hover:underline"
              >
                開く →
              </Link>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/**
 * モジュールがオフのときにページ本体の代わりに出すガード。
 */
export function ModuleGate({
  module,
  children,
}: {
  module: FieldCxModuleId;
  children: React.ReactNode;
}) {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => setEnabled(getModuleState()[module] !== false);
    sync();
    window.addEventListener("field-cx-store", sync);
    return () => window.removeEventListener("field-cx-store", sync);
  }, [module]);

  if (enabled === null) return null;
  if (enabled) return <>{children}</>;

  const meta = FIELD_CX_MODULES.find((m) => m.id === module);
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center">
      <p className="text-3xl" aria-hidden>
        {meta?.emoji}
      </p>
      <h2 className="mt-3 text-lg font-bold text-stone-900">
        「{meta?.name}」はオフになっています
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        Field CX は必要な機能だけを選んで使えます。このモジュールを使う場合は、概要ページからオンにしてください。
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            setModuleEnabled(module, true);
            toast.success(`「${meta?.short}」をオンにしました`);
          }}
          className="inline-flex min-h-11 items-center rounded-full bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-500"
        >
          今すぐオンにする
        </button>
        <Link
          href="/field-cx"
          className="inline-flex min-h-11 items-center rounded-full border border-stone-300 px-5 text-sm font-bold text-stone-600 hover:border-brand-500"
        >
          概要へ戻る
        </Link>
      </div>
    </div>
  );
}
