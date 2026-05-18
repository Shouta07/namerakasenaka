"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PlayCircle, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MealLogWithCommentsList,
  type MealLogWithComments,
  type SalonComment,
} from "@/components/meals/meal-log-with-comments";
import {
  demoClient,
  demoMealLogs,
  demoProgressPhotos,
  demoTreatmentRecords,
} from "@/lib/demo/fixtures";
import {
  useStoredMealLogs,
  useStoredProgressPhotos,
  useStoredSalonComments,
  useStoredTreatmentRecords,
} from "@/lib/demo/store";

type Photo = {
  id: string;
  signedUrl: string;
  caption: string | null;
  takenAt: string;
};

export function DemoTherapistClientDetail() {
  const stored = useStoredProgressPhotos(demoClient.id);
  const storedRecords = useStoredTreatmentRecords(demoClient.id);
  const storedMeals = useStoredMealLogs(demoClient.id);

  const photos = useMemo<Photo[]>(() => {
    const fixtures: Photo[] = demoProgressPhotos.map((p) => ({
      id: p.id,
      signedUrl: p.signedUrl,
      caption: p.caption,
      takenAt: p.takenAt,
    }));
    const mine: Photo[] = stored.map((p) => ({
      id: p.id,
      signedUrl: p.signedUrl,
      caption: p.caption,
      takenAt: p.takenAt,
    }));
    return [...fixtures, ...mine].sort((a, b) =>
      b.takenAt.localeCompare(a.takenAt),
    );
  }, [stored]);

  const records = useMemo(() => {
    const fixture = demoTreatmentRecords.map((r) => ({
      id: r.id,
      performedAt: r.performedAt,
      therapistName: r.therapistName,
      durationMinutes: r.durationMinutes,
      menu: r.menu,
      observations: r.observations,
      homeCareNotes: r.homeCareNotes,
      hasVideo: r.hasVideo,
    }));
    const mine = storedRecords.map((r) => ({
      id: r.id,
      performedAt: r.performedAt,
      therapistName: r.therapistName,
      durationMinutes: r.durationMinutes,
      menu: r.treatmentType,
      observations: r.skinFindings ?? "",
      homeCareNotes: r.nextPlan ?? "",
      hasVideo: false,
    }));
    return [...mine, ...fixture].sort((a, b) =>
      b.performedAt.localeCompare(a.performedAt),
    );
  }, [storedRecords]);

  const recentSalonComments = demoMealLogs
    .filter((m) => m.feedback.salonComment)
    .slice(0, 3);

  const mealsForComposer: MealLogWithComments[] = useMemo(() => {
    const fixture: MealLogWithComments[] = demoMealLogs.slice(0, 3).map((m) => ({
      id: m.id,
      meal_type: m.mealType,
      memo: m.memo,
      logged_at: m.loggedAt,
      comments: m.feedback.salonComment
        ? [
            {
              id: `${m.id}-c0`,
              body: m.feedback.salonComment.body,
              author_role: "therapist" as const,
              created_at: m.feedback.salonComment.postedAt,
            } satisfies SalonComment,
          ]
        : [],
    }));
    const mine: MealLogWithComments[] = storedMeals.map((m) => ({
      id: m.id,
      meal_type: m.mealType,
      memo: m.memo,
      logged_at: m.loggedAt,
      comments: [],
    }));
    return [...mine, ...fixture];
  }, [storedMeals]);

  return (
    <div className="space-y-6">
      <section className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={demoClient.avatarUrl}
          alt={demoClient.displayName}
          className="h-16 w-16 flex-none rounded-full bg-stone-100 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-stone-500">{demoClient.furigana}</p>
          <h1 className="text-xl font-bold text-stone-900">
            {demoClient.displayName} 様
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge tone="neutral">{demoClient.ageRange}</Badge>
            <Badge tone="neutral">{demoClient.skinType}</Badge>
            <Badge tone="brand">
              {demoClient.sessionsCompleted}/{demoClient.sessionsTotal} 回
            </Badge>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-900">進捗写真</h2>
          <Link href={`/t/clients/${demoClient.id}/photos/new`}>
            <Button size="sm" variant="secondary">写真を追加</Button>
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.slice(0, 8).map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-xl border border-stone-200 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.signedUrl}
                alt={p.caption ?? "進捗写真"}
                className="aspect-[3/4] w-full bg-stone-100 object-cover"
              />
              <p className="px-2 py-1 text-[10px] text-stone-500">
                {new Date(p.takenAt).toLocaleDateString("ja-JP")}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-900">施術カルテ</h2>
          <Link href={`/t/clients/${demoClient.id}/records/new`}>
            <Button size="sm" variant="primary">
              <Timer className="h-3.5 w-3.5" />
              90 秒で記録する
            </Button>
          </Link>
        </div>

        <ul className="mt-4 space-y-3">
          {records.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-stone-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-stone-900">
                  {new Date(r.performedAt).toLocaleDateString("ja-JP")} ・ {r.menu}
                </p>
                {r.hasVideo ? <Badge tone="warning">[動画あり]</Badge> : null}
              </div>
              <p className="mt-1 text-xs text-stone-500">
                {r.therapistName} ・ {r.durationMinutes} 分
              </p>
              {r.observations ? (
                <p className="mt-2 text-sm text-stone-700">{r.observations}</p>
              ) : null}
              {r.homeCareNotes ? (
                <p className="mt-1 text-xs text-stone-500">
                  ホームケア: {r.homeCareNotes}
                </p>
              ) : null}
              {r.hasVideo ? (
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 text-xs text-amber-900">
                  <PlayCircle className="h-6 w-6 flex-none" />
                  <div>
                    <p className="font-semibold">施術動画 (00:42)</p>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-stone-900">食事ログとサロンコメント</h2>
        <div className="mt-3">
          <MealsWithStoredComments rows={mealsForComposer} />
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-stone-900">
          直近のサロンコメント（参考）
        </h2>
        <ul className="mt-3 space-y-2">
          {recentSalonComments.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border border-stone-200 bg-white p-3 text-xs"
            >
              <p className="text-stone-500">
                {new Date(m.loggedAt).toLocaleDateString("ja-JP")}
              </p>
              <p className="mt-1 text-stone-700">
                {m.feedback.salonComment?.body}
              </p>
              <p className="mt-1 text-[11px] text-stone-400">
                — {m.feedback.salonComment?.therapistName}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function MealsWithStoredComments({ rows }: { rows: MealLogWithComments[] }) {
  // Merge stored salon comments into each meal log row at render time.
  const enriched = rows.map((row) => <EnrichedRow key={row.id} row={row} />);
  return <div className="space-y-3">{enriched}</div>;
}

function EnrichedRow({ row }: { row: MealLogWithComments }) {
  const stored = useStoredSalonComments(row.id);
  const merged: MealLogWithComments = {
    ...row,
    comments: [
      ...row.comments,
      ...stored.map((c) => ({
        id: c.id,
        body: c.body,
        author_role: c.authorRole,
        created_at: c.createdAt,
      })),
    ].sort((a, b) => a.created_at.localeCompare(b.created_at)),
  };
  return <MealLogWithCommentsList rows={[merged]} composer />;
}
