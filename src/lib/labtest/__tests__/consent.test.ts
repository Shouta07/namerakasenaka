import { describe, expect, it } from "vitest";
import {
  CONSENT_DESCRIPTION,
  CONSENT_SCOPE_LABEL,
  activeScopes,
  canPublishLabtest,
  canSendLine,
  checkConsent,
  type ConsentRecord,
} from "../consent";
import { containsBannedWord } from "@/lib/compliance/banned-words";

/**
 * 同意の判定。
 *
 * ここが崩れると「同意なしに患者のデータを出した」ことになる。
 * 迷ったら不許可、を全ケースで固定する。
 */

function rec(over: Partial<ConsentRecord> = {}): ConsentRecord {
  return {
    id: "c1",
    customerId: "cust-1",
    scope: "labtest_view",
    grantedAt: "2026-05-01T10:00:00.000Z",
    grantedBy: "担当スタッフ",
    revokedAt: null,
    method: "店頭で口頭確認",
    ...over,
  };
}

describe("checkConsent — 記録が無いときは必ず不許可", () => {
  it("記録がひとつも無ければ不許可", () => {
    const d = checkConsent([], "cust-1", "labtest_view");
    expect(d.ok).toBe(false);
    expect(d.reason).toContain("確認できていません");
  });

  it("別の患者の同意では許可しない", () => {
    const d = checkConsent([rec({ customerId: "cust-2" })], "cust-1", "labtest_view");
    expect(d.ok).toBe(false);
  });

  it("別の目的の同意では許可しない（まとめ同意を作らない）", () => {
    const d = checkConsent([rec({ scope: "line_share" })], "cust-1", "labtest_view");
    expect(d.ok).toBe(false);
  });
});

describe("checkConsent — 取り消しは即座に効く", () => {
  it("取り消された記録では許可しない", () => {
    const d = checkConsent(
      [rec({ revokedAt: "2026-06-01T00:00:00.000Z" })],
      "cust-1",
      "labtest_view",
    );
    expect(d.ok).toBe(false);
    expect(d.reason).toContain("取り消され");
  });

  it("「記録が無い」と「取り消された」で理由を書き分ける", () => {
    const none = checkConsent([], "cust-1", "labtest_view").reason;
    const revoked = checkConsent(
      [rec({ revokedAt: "2026-06-01T00:00:00.000Z" })],
      "cust-1",
      "labtest_view",
    ).reason;
    expect(none).not.toBe(revoked);
  });

  it("取り消したあとに取り直せば、いちばん新しい意思が通る", () => {
    const records = [
      rec({ id: "old", grantedAt: "2026-05-01T00:00:00.000Z", revokedAt: "2026-06-01T00:00:00.000Z" }),
      rec({ id: "new", grantedAt: "2026-07-01T00:00:00.000Z" }),
    ];
    expect(checkConsent(records, "cust-1", "labtest_view").ok).toBe(true);
  });

  it("同意のあとに取り消したら、古い同意は効かない", () => {
    const records = [
      rec({ id: "old", grantedAt: "2026-05-01T00:00:00.000Z" }),
      rec({ id: "new", grantedAt: "2026-07-01T00:00:00.000Z", revokedAt: "2026-07-02T00:00:00.000Z" }),
    ];
    expect(checkConsent(records, "cust-1", "labtest_view").ok).toBe(false);
  });
});

describe("目的ごとの入口", () => {
  it("検査の表示に同意していても、LINE 送信は別途必要", () => {
    const records = [rec({ scope: "labtest_view" })];
    expect(canPublishLabtest(records, "cust-1").ok).toBe(true);
    expect(canSendLine(records, "cust-1").ok).toBe(false);
  });

  it("有効な同意だけを一覧できる", () => {
    const records = [
      rec({ id: "a", scope: "labtest_view" }),
      rec({ id: "b", scope: "line_share", revokedAt: "2026-06-01T00:00:00.000Z" }),
      rec({ id: "c", scope: "photo_view" }),
    ];
    expect(activeScopes(records, "cust-1").sort()).toEqual([
      "labtest_view",
      "photo_view",
    ]);
  });
});

describe("同意の説明文", () => {
  const scopes = ["labtest_view", "line_share", "photo_view"] as const;

  it.each(scopes)("%s の説明は「取り消せる」ことを必ず書く", (scope) => {
    expect(CONSENT_DESCRIPTION[scope]).toContain("取り消せます");
  });

  it.each(scopes)("%s の説明は §8.2 の禁止語を含まない", (scope) => {
    const check = containsBannedWord(
      `${CONSENT_SCOPE_LABEL[scope]} ${CONSENT_DESCRIPTION[scope]}`,
    );
    expect(check.hits).toEqual([]);
  });
});
