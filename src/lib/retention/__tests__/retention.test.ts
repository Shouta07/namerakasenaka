import { describe, expect, it } from "vitest";
import {
  DAYS_SINCE_VISIT_HIGH,
  DAYS_SINCE_VISIT_MEDIUM,
  assessAllClients,
  assessClientRisk,
  riskLabel,
  type RetentionAppointment,
  type RetentionClient,
  type RetentionQaMessage,
  type RetentionSelfLog,
} from "../index";

const TODAY = new Date("2026-05-19T00:00:00+09:00");

function appt(
  daysAgo: number,
  clientId: string,
  status: RetentionAppointment["status"] = "completed",
): RetentionAppointment {
  const d = new Date(TODAY.getTime() - daysAgo * 86400000);
  return {
    id: `a-${daysAgo}-${clientId}`,
    clientId,
    scheduledAt: d.toISOString(),
    status,
  };
}

function futureAppt(daysAhead: number, clientId: string): RetentionAppointment {
  const d = new Date(TODAY.getTime() + daysAhead * 86400000);
  return {
    id: `f-${daysAhead}-${clientId}`,
    clientId,
    scheduledAt: d.toISOString(),
    status: "confirmed",
  };
}

function selfLog(daysAgo: number, clientId: string): RetentionSelfLog {
  const d = new Date(TODAY.getTime() - daysAgo * 86400000);
  return {
    id: `s-${daysAgo}-${clientId}`,
    clientId,
    loggedOn: d.toISOString().slice(0, 10),
  };
}

function msg(
  daysAgo: number,
  conversationId: string,
  isMine: boolean,
): RetentionQaMessage {
  const d = new Date(TODAY.getTime() - daysAgo * 86400000);
  return {
    id: `m-${daysAgo}-${conversationId}-${isMine}`,
    conversationId,
    createdAt: d.toISOString(),
    isMine,
  };
}

const baseClient: RetentionClient = {
  id: "c1",
  displayName: "テスト顧客",
  qaConversationId: "qa-c1",
};

describe("assessClientRisk", () => {
  it("is low when there is recent visit, no unanswered Q&A, regular logging", () => {
    const r = assessClientRisk({
      client: baseClient,
      appointments: [appt(3, "c1"), appt(20, "c1")],
      selfLogs: [selfLog(2, "c1"), selfLog(5, "c1"), selfLog(8, "c1")],
      qaMessages: [msg(2, "qa-c1", true)],
      photos: [],
      today: TODAY,
    });
    expect(r.level).toBe("low");
    expect(r.daysSinceLastVisit).toBe(3);
  });

  it("is medium when last visit is between thresholds", () => {
    const days = DAYS_SINCE_VISIT_MEDIUM + 1;
    const r = assessClientRisk({
      client: baseClient,
      appointments: [appt(days, "c1")],
      selfLogs: [selfLog(2, "c1")],
      qaMessages: [],
      photos: [],
      today: TODAY,
    });
    expect(r.level).toBe("medium");
    expect(r.reasons.some((x) => x.includes("最終来店"))).toBe(true);
  });

  it("is high when last visit is over the high threshold", () => {
    const days = DAYS_SINCE_VISIT_HIGH + 5;
    const r = assessClientRisk({
      client: baseClient,
      appointments: [appt(days, "c1")],
      selfLogs: [],
      qaMessages: [],
      photos: [],
      today: TODAY,
    });
    expect(r.level).toBe("high");
  });

  it("bumps level when previously regular self-logging stops", () => {
    // Visit was 18 days ago (medium) and self-log gap is 14 days but prior was regular.
    const r = assessClientRisk({
      client: baseClient,
      appointments: [appt(18, "c1")],
      selfLogs: [
        // Prior window (between 30 and 60 days ago) — three regular logs.
        selfLog(55, "c1"),
        selfLog(45, "c1"),
        selfLog(35, "c1"),
        // Most recent log is 14 days ago.
        selfLog(14, "c1"),
      ],
      qaMessages: [],
      photos: [],
      today: TODAY,
    });
    expect(r.level).toBe("high");
    expect(r.reasons.some((x) => x.includes("セルフログ"))).toBe(true);
  });

  it("is high when client's question is unanswered for over the threshold", () => {
    const r = assessClientRisk({
      client: baseClient,
      appointments: [appt(2, "c1")],
      selfLogs: [selfLog(1, "c1")],
      qaMessages: [msg(5, "qa-c1", false)],
      photos: [],
      today: TODAY,
    });
    expect(r.level).toBe("high");
    expect(r.reasons.some((x) => x.includes("未返信"))).toBe(true);
  });

  it("is medium when course is completed with no future appointment", () => {
    const r = assessClientRisk({
      client: {
        ...baseClient,
        sessionsCompleted: 6,
        sessionsTotal: 6,
      },
      appointments: [appt(7, "c1")],
      selfLogs: [selfLog(2, "c1")],
      qaMessages: [],
      photos: [],
      today: TODAY,
    });
    expect(r.level).toBe("medium");
    expect(r.reasons.some((x) => x.includes("コース完了"))).toBe(true);
  });

  it("does not flag completed course when a future appointment exists", () => {
    const r = assessClientRisk({
      client: {
        ...baseClient,
        sessionsCompleted: 6,
        sessionsTotal: 6,
      },
      appointments: [appt(7, "c1"), futureAppt(10, "c1")],
      selfLogs: [selfLog(2, "c1")],
      qaMessages: [],
      photos: [],
      today: TODAY,
    });
    expect(r.level).toBe("low");
  });

  it("returns null daysSinceLastVisit when no completed appointments", () => {
    const r = assessClientRisk({
      client: baseClient,
      appointments: [],
      selfLogs: [],
      qaMessages: [],
      photos: [],
      today: TODAY,
    });
    expect(r.daysSinceLastVisit).toBeNull();
  });
});

describe("assessAllClients", () => {
  it("buckets clients into high / medium / low", () => {
    const result = assessAllClients({
      clients: [
        { id: "low", displayName: "Low Client", qaConversationId: "qa-low" },
        { id: "med", displayName: "Med Client", qaConversationId: "qa-med" },
        { id: "high", displayName: "High Client", qaConversationId: "qa-high" },
      ],
      appointments: [
        appt(2, "low"),
        appt(DAYS_SINCE_VISIT_MEDIUM + 2, "med"),
        appt(DAYS_SINCE_VISIT_HIGH + 3, "high"),
      ],
      selfLogs: [selfLog(1, "low"), selfLog(3, "med")],
      qaMessages: [],
      photos: [],
      today: TODAY,
    });
    expect(result.low.length).toBe(1);
    expect(result.medium.length).toBe(1);
    expect(result.high.length).toBe(1);
  });
});

describe("riskLabel", () => {
  it("returns Japanese tone+text", () => {
    expect(riskLabel("high").text).toBe("高");
    expect(riskLabel("medium").text).toBe("中");
    expect(riskLabel("low").text).toBe("低");
  });
});
