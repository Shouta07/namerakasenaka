"use client";

import { useEffect, useState } from "react";
import { Presentation } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const KEY = "senacare-presentation-mode";

function readInitial(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("presenter") === "1") {
      window.localStorage.setItem(KEY, "1");
      return true;
    }
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** Read once (non-reactive, e.g. for sibling components inside same render). */
export function isPresentationModeActive(): boolean {
  return readInitial();
}

/** Reactive hook that listens to a custom storage event. */
export function usePresentationMode(): {
  active: boolean;
  toggle: () => void;
  setActive: (v: boolean) => void;
} {
  const [active, setActive] = useState(false);
  useEffect(() => {
    setActive(readInitial());
    function onStorage(e: StorageEvent) {
      if (e.key === KEY) setActive(e.newValue === "1");
    }
    function onCustom() {
      setActive(readInitial());
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("senacare-presentation-changed", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("senacare-presentation-changed", onCustom);
    };
  }, []);

  function apply(v: boolean) {
    try {
      window.localStorage.setItem(KEY, v ? "1" : "0");
      window.dispatchEvent(new CustomEvent("senacare-presentation-changed"));
    } catch {
      // ignore
    }
    setActive(v);
    // Toggle a body class so anywhere can style.
    if (typeof document !== "undefined") {
      document.body.dataset.presenter = v ? "1" : "0";
    }
  }

  return {
    active,
    toggle: () => apply(!active),
    setActive: apply,
  };
}

/**
 * Top-right toggle pill. When active, the body gains a `data-presenter="1"`
 * attribute and the DemoBanner / sample affordances hide themselves.
 */
export function PresentationModeToggle() {
  const { active, toggle } = usePresentationMode();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      title={active ? "プレゼンモード ON" : "プレゼンモード OFF"}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium shadow-sm transition-colors",
        active
          ? "border-brand-300 bg-brand-50 text-brand-700"
          : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50",
      )}
    >
      <Presentation className="h-3 w-3" />
      <span>プレゼン</span>
      <span
        className={cn(
          "ml-0.5 rounded px-1 text-[9px] font-semibold",
          active ? "bg-brand-700 text-white" : "bg-stone-200 text-stone-600",
        )}
      >
        {active ? "ON" : "OFF"}
      </span>
    </button>
  );
}
