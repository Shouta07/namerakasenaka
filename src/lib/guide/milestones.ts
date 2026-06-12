/**
 * 達成と祝福 — デイリーチェック履歴から連続記録・マイルストーンを計算する
 * 純粋関数群。UI（change-record-card / daily-check-card）から共用される。
 *
 * 設計思想（§17 / ブランドボイス）:
 * - 「記録すること」自体が習慣 — おやすみの日（actionDone=false）も
 *   記録さえあれば連続日数にカウントする。休んだ日を罰しない。
 * - 下降トレンドでもネガティブな言葉は出さない（表示側で担保）。
 */

/** computeCheckStats が必要とする最小限の形 — Stored/Demo の両方が満たす。 */
export type DailyCheckLike = {
  /** YYYY-MM-DD */
  date: string;
  actionDone: boolean;
  skinCondition?: number | null;
};

export type MilestoneId = "3days" | "7days" | "14days" | "28days";

export const MILESTONE_DAYS: Record<MilestoneId, number> = {
  "3days": 3,
  "7days": 7,
  "14days": 14,
  "28days": 28,
};

export type CheckStats = {
  /** 記録した日数（日付ユニーク）。 */
  totalDays: number;
  /** actionDone = true の日数。 */
  doneDays: number;
  /** 連続記録日数 — 今日まで、または（今日未記録なら）昨日まで。 */
  currentStreak: number;
  longestStreak: number;
  /** 直近5件 vs 最初5件の skinCondition 平均比較。 */
  skinTrend: "up" | "flat" | "down" | "unknown";
  /** 連続記録がはじめて n 日に達した日（YYYY-MM-DD）。未達は null。 */
  milestones: Array<{ id: MilestoneId; reachedAt: string | null }>;
};

const MS_PER_DAY = 86_400_000;

function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Days between two YYYY-MM-DD strings (b - a), timezone-safe via UTC math. */
function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / MS_PER_DAY);
}

export function computeCheckStats(
  checks: DailyCheckLike[],
  today: Date = new Date(),
): CheckStats {
  // Dedupe by date (later entry wins) and sort chronologically.
  const byDate = new Map<string, DailyCheckLike>();
  for (const c of checks) byDate.set(c.date, c);
  const sorted = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));

  const totalDays = sorted.length;
  const doneDays = sorted.filter((c) => c.actionDone).length;

  // --- streaks: consecutive calendar days with ANY record (rest counts) ---
  const milestoneReached: Partial<Record<MilestoneId, string>> = {};
  let longestStreak = 0;
  let runLength = 0;
  for (let i = 0; i < sorted.length; i++) {
    runLength = i > 0 && dayDiff(sorted[i - 1].date, sorted[i].date) === 1 ? runLength + 1 : 1;
    longestStreak = Math.max(longestStreak, runLength);
    for (const [id, n] of Object.entries(MILESTONE_DAYS) as [MilestoneId, number][]) {
      if (runLength === n && milestoneReached[id] == null) {
        milestoneReached[id] = sorted[i].date;
      }
    }
  }

  // currentStreak: anchored at today (if recorded) or yesterday — otherwise 0.
  const todayStr = toLocalDateString(today);
  const last = sorted[sorted.length - 1];
  let currentStreak = 0;
  if (last) {
    const gapToToday = dayDiff(last.date, todayStr);
    if (gapToToday === 0 || gapToToday === 1) {
      currentStreak = 1;
      for (let i = sorted.length - 1; i > 0; i--) {
        if (dayDiff(sorted[i - 1].date, sorted[i].date) === 1) currentStreak++;
        else break;
      }
    }
  }

  // --- skin trend: avg of last 5 skin values vs first 5 ---
  const skinValues = sorted
    .map((c) => c.skinCondition)
    .filter((v): v is number => typeof v === "number");
  let skinTrend: CheckStats["skinTrend"] = "unknown";
  if (skinValues.length >= 6) {
    const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
    const delta = avg(skinValues.slice(-5)) - avg(skinValues.slice(0, 5));
    skinTrend = delta >= 0.3 ? "up" : delta <= -0.3 ? "down" : "flat";
  }

  return {
    totalDays,
    doneDays,
    currentStreak,
    longestStreak,
    skinTrend,
    milestones: (Object.keys(MILESTONE_DAYS) as MilestoneId[]).map((id) => ({
      id,
      reachedAt: milestoneReached[id] ?? null,
    })),
  };
}

/** 直近で達したマイルストーン（reachedAt が最新のもの）。なければ null。 */
export function latestReachedMilestone(
  stats: CheckStats,
): { id: MilestoneId; reachedAt: string } | null {
  let latest: { id: MilestoneId; reachedAt: string } | null = null;
  for (const m of stats.milestones) {
    if (m.reachedAt && (!latest || m.reachedAt > latest.reachedAt)) {
      latest = { id: m.id, reachedAt: m.reachedAt };
    }
  }
  return latest;
}
