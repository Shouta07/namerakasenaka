"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, ChevronDown, Salad, Stethoscope, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type PersonaKey = "salon" | "therapist" | "client";

type Persona = {
  key: PersonaKey;
  label: string;
  short: string;
  href: string;
  iconKey: "briefcase" | "stethoscope" | "user" | "salad";
};

const PERSONAS: Persona[] = [
  { key: "salon", label: "経営者", short: "経営", href: "/", iconKey: "briefcase" },
  { key: "therapist", label: "セラピスト", short: "施術", href: "/t/today", iconKey: "stethoscope" },
  { key: "client", label: "顧客", short: "顧客", href: "/c/progress", iconKey: "user" },
];

const STORAGE_KEY = "senacare-active-persona";

function renderIcon(name: Persona["iconKey"]) {
  const cls = "h-3.5 w-3.5";
  if (name === "briefcase") return <Briefcase className={cls} />;
  if (name === "stethoscope") return <Stethoscope className={cls} />;
  if (name === "user") return <User className={cls} />;
  return <Salad className={cls} />;
}

/**
 * Discreet persona switcher pill. Shows the current persona and opens a small
 * menu of the four perspectives. Selection navigates to the canonical home of
 * that role and persists in localStorage.
 */
export function PersonaSwitcher({ active }: { active: PersonaKey }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [stored, setStored] = useState<PersonaKey>(active);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      if (v === "salon" || v === "therapist" || v === "client") {
        setStored(v);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const current = PERSONAS.find((p) => p.key === stored) ?? PERSONAS[0];

  function select(p: Persona) {
    try {
      window.localStorage.setItem(STORAGE_KEY, p.key);
    } catch {
      // ignore
    }
    setStored(p.key);
    setOpen(false);
    router.push(p.href);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="tap-44 inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-700 shadow-sm hover:bg-stone-50"
      >
        {renderIcon(current.iconKey)}
        <span>{current.label}</span>
        <ChevronDown className="h-3 w-3 text-stone-400" />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-lg border border-stone-200 bg-white py-1 shadow-lg"
        >
          {PERSONAS.map((p) => (
            <button
              key={p.key}
              type="button"
              role="menuitem"
              onClick={() => select(p)}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-xs",
                p.key === stored
                  ? "bg-brand-50 text-brand-700"
                  : "text-stone-700 hover:bg-stone-50",
              )}
            >
              {renderIcon(p.iconKey)}
              <span className="flex-1">{p.label}</span>
              {p.key === stored ? (
                <span className="text-[10px] text-brand-600">現在</span>
              ) : null}
            </button>
          ))}
          <div className="border-t border-stone-100 px-3 py-1.5 text-[10px] text-stone-400">
            視点を切替（社内ツール）
          </div>
        </div>
      ) : null}
    </div>
  );
}
