import { describe, expect, it } from "vitest";
import {
  DEMO_GUIDE_CUSTOMERS,
  DEMO_GUIDE_MESSAGES,
  DEMO_DAILY_CHECKS,
  TAMURA_GUIDE_CUSTOMER_ID,
} from "@/lib/demo/recovery-fixtures";
import { demoClient } from "@/lib/demo/fixtures";
import { containsBannedWord } from "@/lib/compliance/banned-words";

/**
 * 伴走ループ — サロン→顧客メッセージとペルソナ統一の不変条件を担保する。
 *
 * 1) banned-word filter: すべての salon_to_customer 本文が §8.2 + §17 を通過。
 * 2) persona unify: demoClient.displayName が「田村」を含み、recovery-fixture の
 *    clientId がそれに紐付いていること。
 * 3) ordering & unread counting: source ヘルパが新着順を保ち、未読を正しく数えること。
 */

describe("companion messages — banned-word filter", () => {
  it("every demo salon→customer body passes §8.2 + §17", () => {
    for (const m of DEMO_GUIDE_MESSAGES) {
      const check = containsBannedWord(m.body);
      expect(check.hits, `${m.id}: ${check.hits.join(", ")}`).toEqual([]);
    }
  });

  it("flags a salon reply that uses a banned phrase", () => {
    const bad = containsBannedWord("これを続ければ必ず治ります。");
    expect(bad.ok).toBe(false);
    expect(bad.hits).toContain("治ります");
  });

  it("allows gentle reply phrasing the salon would actually send", () => {
    const ok = containsBannedWord(
      "3日続きましたね、すばらしい積み重ねです。あなたのペースで、一緒に歩んでいきましょう。",
    );
    expect(ok.ok).toBe(true);
  });
});

describe("persona unify — 田村 洋子 across demo + recovery fixtures", () => {
  it("primary demo client display name includes 田村", () => {
    expect(demoClient.displayName).toContain("田村");
  });

  it("recovery-fixture clientId resolves to the demo client id", () => {
    const tamura = DEMO_GUIDE_CUSTOMERS.find(
      (c) => c.id === TAMURA_GUIDE_CUSTOMER_ID,
    );
    expect(tamura).toBeDefined();
    expect(tamura!.clientId).toBe(demoClient.id);
  });

  it("avatar would render 田 — first character of the unified display name", () => {
    expect(demoClient.displayName.charAt(0)).toBe("田");
  });
});

describe("companion messages — ordering and unread counting", () => {
  function sortedNewestFirst(
    msgs: typeof DEMO_GUIDE_MESSAGES,
  ): typeof DEMO_GUIDE_MESSAGES {
    return [...msgs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  it("DEMO_GUIDE_MESSAGES seed contains exactly one unread for the demo", () => {
    const unread = DEMO_GUIDE_MESSAGES.filter(
      (m) =>
        m.guideCustomerId === TAMURA_GUIDE_CUSTOMER_ID && m.readAt === null,
    );
    expect(unread.length).toBe(1);
  });

  it("newest-first ordering puts the unread reply at the top", () => {
    const ordered = sortedNewestFirst(
      DEMO_GUIDE_MESSAGES.filter(
        (m) => m.guideCustomerId === TAMURA_GUIDE_CUSTOMER_ID,
      ),
    );
    expect(ordered[0].readAt).toBeNull();
  });

  it("at least one reply links to a check-in memo on the same date", () => {
    const linked = DEMO_GUIDE_MESSAGES.filter(
      (m) => m.respondingToCheckDate !== null,
    );
    expect(linked.length).toBeGreaterThan(0);
    for (const m of linked) {
      const target = DEMO_DAILY_CHECKS.find(
        (c) => c.date === m.respondingToCheckDate,
      );
      expect(target, `no check on ${m.respondingToCheckDate}`).toBeDefined();
      expect(target!.memo, "linked memo should not be empty").toBeTruthy();
    }
  });

  it("at least 2 daily checks have meaningful memos for the demo loop", () => {
    const withMemo = DEMO_DAILY_CHECKS.filter(
      (c) => c.memo && c.memo.trim().length > 0,
    );
    expect(withMemo.length).toBeGreaterThanOrEqual(2);
  });
});
