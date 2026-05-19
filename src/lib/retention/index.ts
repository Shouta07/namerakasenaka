/**
 * Retention risk engine.
 *
 * Pure typed helpers — no Supabase, no localStorage. Hydrate the data, pass
 * it in, get a typed risk assessment back. Powers /admin/at-risk and the
 * dashboard widgets.
 *
 * Thresholds are exported so future tuning is trivial. They are intentionally
 * conservative — we'd rather over-warn the salon than miss someone slipping
 * away.
 */

/** A visit is "concerning" once it has been this many days. */
export const DAYS_SINCE_VISIT_MEDIUM = 14;
export const DAYS_SINCE_VISIT_HIGH = 21;

/** When a client was previously logging regularly and stops. */
export const DAYS_SINCE_SELF_LOG_BUMP = 10;

/** Failing-them threshold: oldest unanswered question from the client. */
export const DAYS_UNANSWERED_HIGH = 3;

/** Window used to test "previously logging regularly". */
export const PRIOR_LOG_WINDOW_DAYS = 30;
export const PRIOR_LOG_COUNT = 3;

export type RiskLevel = "low" | "medium" | "high";

export type RetentionAppointment = {
  id: string;
  clientId: string;
  scheduledAt: string;
  status: "requested" | "confirmed" | "completed" | "cancelled" | "no_show";
};

export type RetentionSelfLog = {
  id: string;
  clientId: string;
  loggedOn: string;
};

export type RetentionQaMessage = {
  id: string;
  conversationId: string;
  createdAt: string;
  /** True when written by the salon (us). */
  isMine: boolean;
};

export type RetentionPhoto = {
  id: string;
  clientId: string;
  takenAt: string;
};

export type RetentionClient = {
  id: string;
  displayName: string;
  qaConversationId?: string;
  sessionsCompleted?: number;
  sessionsTotal?: number;
};

export type ClientRisk = {
  clientId: string;
  clientDisplayName: string;
  level: RiskLevel;
  reasons: string[];
  lastActivityAt: Date | null;
  daysSinceLastVisit: number | null;
  daysSinceLastSelfLog: number | null;
};

export type AssessClientRiskInput = {
  client: RetentionClient;
  appointments: RetentionAppointment[];
  selfLogs: RetentionSelfLog[];
  qaMessages: RetentionQaMessage[];
  photos: RetentionPhoto[];
  today?: Date;
};

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}

function parseDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00+09:00`);
  }
  return new Date(value);
}

function bumpLevel(level: RiskLevel): RiskLevel {
  if (level === "low") return "medium";
  if (level === "medium") return "high";
  return "high";
}

/**
 * Assess a single client's retention risk.
 *
 * Heuristics (all signals additive; level is the max of any rule it hits):
 *  - daysSinceLastVisit > DAYS_SINCE_VISIT_HIGH        → high
 *  - daysSinceLastVisit > DAYS_SINCE_VISIT_MEDIUM      → medium
 *  - was logging regularly and now > DAYS_SINCE_SELF_LOG_BUMP without one
 *                                                       → bump one level
 *  - unanswered Q&A from client older than DAYS_UNANSWERED_HIGH
 *                                                       → high (we are failing them)
 *  - course completed && no future appointment          → medium
 */
export function assessClientRisk(input: AssessClientRiskInput): ClientRisk {
  const today = input.today ?? new Date();
  const { client, appointments, selfLogs, qaMessages, photos } = input;

  const reasons: string[] = [];
  let level: RiskLevel = "low";

  // Filter appointments for this client.
  const mineAppts = appointments
    .filter((a) => a.clientId === client.id)
    .slice()
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  // Last visit = most recent completed appointment.
  const completed = mineAppts.filter((a) => a.status === "completed");
  const lastVisit = completed.length
    ? parseDate(completed[completed.length - 1].scheduledAt)
    : null;
  const daysSinceLastVisit = lastVisit ? daysBetween(lastVisit, today) : null;

  if (daysSinceLastVisit != null) {
    if (daysSinceLastVisit > DAYS_SINCE_VISIT_HIGH) {
      level = "high";
      reasons.push(`最終来店から${daysSinceLastVisit}日経過`);
    } else if (daysSinceLastVisit > DAYS_SINCE_VISIT_MEDIUM) {
      if (level === "low") level = "medium";
      reasons.push(`最終来店から${daysSinceLastVisit}日経過`);
    }
  }

  // Self-log signals.
  const mineLogs = selfLogs
    .filter((s) => s.clientId === client.id)
    .slice()
    .sort((a, b) => a.loggedOn.localeCompare(b.loggedOn));
  const lastLog =
    mineLogs.length > 0 ? parseDate(mineLogs[mineLogs.length - 1].loggedOn) : null;
  const daysSinceLastSelfLog = lastLog ? daysBetween(lastLog, today) : null;

  if (daysSinceLastSelfLog != null && daysSinceLastSelfLog > DAYS_SINCE_SELF_LOG_BUMP) {
    // Was the client previously logging regularly?
    const earlierWindow = today.getTime() - PRIOR_LOG_WINDOW_DAYS * 86400000 * 2;
    const recentWindow = today.getTime() - PRIOR_LOG_WINDOW_DAYS * 86400000;
    const priorCount = mineLogs.filter((s) => {
      const t = parseDate(s.loggedOn).getTime();
      return t >= earlierWindow && t < recentWindow;
    }).length;
    if (priorCount >= PRIOR_LOG_COUNT) {
      level = bumpLevel(level);
      reasons.push(
        `セルフログが${daysSinceLastSelfLog}日途切れています（以前は定期的に記録）`,
      );
    }
  }

  // Unanswered Q&A from the client.
  if (client.qaConversationId) {
    const thread = qaMessages
      .filter((m) => m.conversationId === client.qaConversationId)
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (thread.length > 0) {
      const last = thread[thread.length - 1];
      if (!last.isMine) {
        const age = daysBetween(parseDate(last.createdAt), today);
        if (age > DAYS_UNANSWERED_HIGH) {
          level = "high";
          reasons.push(`未返信のQ&Aが${age}日経過`);
        } else if (age >= 1) {
          if (level === "low") level = "medium";
          reasons.push(`未返信のQ&Aあり (${age}日)`);
        }
      }
    }
  }

  // Course completed and no upcoming appointment.
  if (
    typeof client.sessionsCompleted === "number" &&
    typeof client.sessionsTotal === "number" &&
    client.sessionsTotal > 0 &&
    client.sessionsCompleted >= client.sessionsTotal
  ) {
    const future = mineAppts.find(
      (a) =>
        parseDate(a.scheduledAt).getTime() > today.getTime() &&
        a.status !== "cancelled" &&
        a.status !== "no_show",
    );
    if (!future) {
      if (level === "low") level = "medium";
      reasons.push("コース完了済み・次回予約なし");
    }
  }

  // lastActivityAt across all signals.
  const allActivity: Date[] = [];
  if (lastVisit) allActivity.push(lastVisit);
  if (lastLog) allActivity.push(lastLog);
  for (const p of photos) {
    if (p.clientId === client.id) allActivity.push(parseDate(p.takenAt));
  }
  if (client.qaConversationId) {
    for (const m of qaMessages) {
      if (m.conversationId === client.qaConversationId) {
        allActivity.push(parseDate(m.createdAt));
      }
    }
  }
  const lastActivityAt =
    allActivity.length > 0
      ? allActivity.reduce((a, b) => (a > b ? a : b))
      : null;

  // If level is still low, sanity-check: any activity within 14 days?
  if (level === "low" && lastActivityAt) {
    const ageDays = daysBetween(lastActivityAt, today);
    if (ageDays > DAYS_SINCE_VISIT_MEDIUM) {
      level = "medium";
      reasons.push(`${ageDays}日間アクティビティなし`);
    }
  }

  return {
    clientId: client.id,
    clientDisplayName: client.displayName,
    level,
    reasons,
    lastActivityAt,
    daysSinceLastVisit,
    daysSinceLastSelfLog,
  };
}

export type AssessAllClientsInput = {
  clients: RetentionClient[];
  appointments: RetentionAppointment[];
  selfLogs: RetentionSelfLog[];
  qaMessages: RetentionQaMessage[];
  photos: RetentionPhoto[];
  today?: Date;
};

export type AssessAllClientsResult = {
  high: ClientRisk[];
  medium: ClientRisk[];
  low: ClientRisk[];
};

export function assessAllClients(
  input: AssessAllClientsInput,
): AssessAllClientsResult {
  const out: AssessAllClientsResult = { high: [], medium: [], low: [] };
  for (const client of input.clients) {
    const r = assessClientRisk({
      client,
      appointments: input.appointments,
      selfLogs: input.selfLogs,
      qaMessages: input.qaMessages,
      photos: input.photos,
      today: input.today,
    });
    out[r.level].push(r);
  }
  return out;
}

export function riskLabel(level: RiskLevel): {
  text: string;
  tone: "neutral" | "warning" | "danger";
} {
  switch (level) {
    case "high":
      return { text: "高", tone: "danger" };
    case "medium":
      return { text: "中", tone: "warning" };
    case "low":
    default:
      return { text: "低", tone: "neutral" };
  }
}
