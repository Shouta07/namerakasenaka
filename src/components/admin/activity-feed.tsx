"use client";

import Link from "next/link";
import { Activity, Camera, MessageCircle, Salad, CheckCircle2, CalendarCheck } from "lucide-react";
import { relativeTimeJa } from "@/lib/demo/time";
import { CustomerAvatar } from "@/components/ui/customer-avatar";

export type ActivityFeedEntryKind =
  | "photo"
  | "meal"
  | "nutritionist_approval"
  | "appointment"
  | "qa"
  | "completion";

export type ActivityFeedEntry = {
  id: string;
  kind: ActivityFeedEntryKind;
  actor: string;
  actorRole?: "customer" | "therapist" | "neutral";
  body: string;
  at: string;
  href?: string;
};

const ICONS: Record<ActivityFeedEntryKind, React.ComponentType<{ className?: string }>> = {
  photo: Camera,
  meal: Salad,
  nutritionist_approval: CheckCircle2,
  appointment: CalendarCheck,
  qa: MessageCircle,
  completion: CheckCircle2,
};

const ICON_BG: Record<ActivityFeedEntryKind, string> = {
  photo: "bg-brand-50 text-brand-700",
  meal: "bg-emerald-50 text-emerald-700",
  nutritionist_approval: "bg-teal-50 text-teal-700",
  appointment: "bg-sky-50 text-sky-700",
  qa: "bg-amber-50 text-amber-700",
  completion: "bg-stone-100 text-stone-700",
};

/**
 * Activity feed — shows the last N actions across the salon with relative
 * time. Computed at render time so the labels always read "X 分前" even if the
 * page was bundled weeks ago.
 */
export function ActivityFeed({
  entries,
  title = "活動ログ",
  limit = 8,
}: {
  entries: ActivityFeedEntry[];
  title?: string;
  limit?: number;
}) {
  const shown = entries.slice(0, limit);
  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <header className="flex items-center gap-1.5 border-b border-stone-200 px-4 py-2.5">
        <Activity className="h-3.5 w-3.5 text-stone-500" />
        <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
      </header>
      <ul className="divide-y divide-stone-100">
        {shown.map((e) => {
          const Icon = ICONS[e.kind];
          const row = (
            <span className="flex items-start gap-2.5 px-4 py-2.5">
              <span
                className={`flex h-7 w-7 flex-none items-center justify-center rounded-full ${ICON_BG[e.kind]}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <CustomerAvatar
                    name={e.actor}
                    size="xs"
                    role={e.actorRole ?? "neutral"}
                  />
                  <span className="truncate text-[12px] font-medium text-stone-900">
                    {e.actor}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-stone-600">
                  {e.body}
                </span>
                <span className="mt-0.5 block text-[10px] text-stone-400">
                  {relativeTimeJa(e.at)}
                </span>
              </span>
            </span>
          );
          return (
            <li key={e.id}>
              {e.href ? (
                <Link href={e.href} className="block hover:bg-stone-50">
                  {row}
                </Link>
              ) : (
                row
              )}
            </li>
          );
        })}
        {shown.length === 0 ? (
          <li className="px-4 py-6 text-center text-[11px] text-stone-400">
            まだ活動はありません
          </li>
        ) : null}
      </ul>
    </div>
  );
}
