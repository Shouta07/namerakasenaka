import { describe, expect, it, vi } from "vitest";
import {
  labPublishedText,
  prepareLineMessage,
  pushLineMessage,
  weeklyCheckinText,
} from "../send";
import type { ConsentRecord } from "@/lib/labtest/consent";

/**
 * LINE 送信の関門。
 *
 * 送ってしまってからでは取り返しがつかないものを、ここで止める。
 * トーク履歴は端末に残り、家族に見られることもあり、退会後も消せない。
 */

function consent(over: Partial<ConsentRecord> = {}): ConsentRecord {
  return {
    id: "c1",
    customerId: "cust-1",
    scope: "line_share",
    grantedAt: "2026-05-01T00:00:00.000Z",
    grantedBy: "担当",
    revokedAt: null,
    method: "店頭で口頭確認",
    ...over,
  };
}

const OK_TEXT = "田中 太郎 様\n\n今週のふりかえりをお願いします。\nhttps://example.test/c/guide";

describe("同意が無ければ送らない", () => {
  it("記録が無ければ拒否", () => {
    const r = prepareLineMessage({ customerId: "cust-1", consents: [], text: OK_TEXT });
    expect(r.ok).toBe(false);
  });

  it("取り消し済みなら拒否", () => {
    const r = prepareLineMessage({
      customerId: "cust-1",
      consents: [consent({ revokedAt: "2026-06-01T00:00:00.000Z" })],
      text: OK_TEXT,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain("取り消され");
  });

  it("検査表示の同意だけでは送れない（目的が違う）", () => {
    const r = prepareLineMessage({
      customerId: "cust-1",
      consents: [consent({ scope: "labtest_view" })],
      text: OK_TEXT,
    });
    expect(r.ok).toBe(false);
  });

  it("line_share の同意があれば送れる", () => {
    const r = prepareLineMessage({
      customerId: "cust-1",
      consents: [consent()],
      text: OK_TEXT,
    });
    expect(r.ok).toBe(true);
  });
});

describe("検査の数値を LINE に置かせない", () => {
  const consents = [consent()];

  it.each([
    "フェリチンが 42 ng/ml でした",
    "亜鉛 62μg/dl まで上がりました",
    "HbA1c は 5.8% です",
    "ALT 18 U/L",
  ])('"%s" は拒否する', (text) => {
    const r = prepareLineMessage({ customerId: "cust-1", consents, text });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain("リンク");
  });

  it("数値を含まない案内は通る", () => {
    const r = prepareLineMessage({
      customerId: "cust-1",
      consents,
      text: labPublishedText("田中 太郎", "https://example.test/c/guide"),
    });
    expect(r.ok).toBe(true);
  });

  it("日付や時刻だけなら通る（単位が付いていない数字は止めない）", () => {
    const r = prepareLineMessage({
      customerId: "cust-1",
      consents,
      text: "次回のご予約は 8月3日 14:00 です。",
    });
    expect(r.ok).toBe(true);
  });
});

describe("表現の関門", () => {
  const consents = [consent()];

  it("禁止語を含む本文は送らない", () => {
    const r = prepareLineMessage({
      customerId: "cust-1",
      consents,
      text: "続ければ必ず治りますよ。",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain("使用できない表現");
  });

  it("空文字は送らない", () => {
    expect(
      prepareLineMessage({ customerId: "cust-1", consents, text: "   " }).ok,
    ).toBe(false);
  });

  it("長すぎる本文は送らない（リンクで渡す設計に寄せる）", () => {
    const r = prepareLineMessage({
      customerId: "cust-1",
      consents,
      text: "あ".repeat(401),
    });
    expect(r.ok).toBe(false);
  });
});

describe("定型文", () => {
  it("週次のふりかえりに数値が入っていない", () => {
    const t = weeklyCheckinText("田中 太郎", "https://example.test/c/guide");
    const r = prepareLineMessage({
      customerId: "cust-1",
      consents: [consent()],
      text: t,
    });
    expect(r.ok).toBe(true);
  });

  it("定型文はどれも禁止語を通る", () => {
    for (const t of [
      weeklyCheckinText("田中 太郎", "https://example.test/x"),
      labPublishedText("田中 太郎", "https://example.test/x"),
    ]) {
      const r = prepareLineMessage({
        customerId: "cust-1",
        consents: [consent()],
        text: t,
      });
      expect(r.ok, t).toBe(true);
    }
  });
});

describe("pushLineMessage — 失敗を現場の言葉にする", () => {
  function fakeFetch(status: number) {
    return vi.fn(async () =>
      new Response(status === 200 ? "{}" : "err", { status }),
    ) as unknown as typeof fetch;
  }

  it("成功したら ok", async () => {
    const r = await pushLineMessage("tok", "U1", "hi", fakeFetch(200));
    expect(r.ok).toBe(true);
  });

  it("401 は再発行を案内する", async () => {
    const r = await pushLineMessage("tok", "U1", "hi", fakeFetch(401));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain("発行し直し");
  });

  it("429 は時間をおくよう伝える", async () => {
    const r = await pushLineMessage("tok", "U1", "hi", fakeFetch(429));
    if (!r.ok) expect(r.reason).toContain("時間をおいて");
  });

  it("トークンは Authorization ヘッダにだけ載る（本文に混ぜない）", async () => {
    const spy = vi.fn(async () => new Response("{}", { status: 200 }));
    await pushLineMessage("secret-token", "U1", "hi", spy as unknown as typeof fetch);
    const [, init] = spy.mock.calls[0] as unknown as [string, RequestInit];
    expect(String(init.body)).not.toContain("secret-token");
    expect(
      (init.headers as Record<string, string>).authorization,
    ).toContain("secret-token");
  });
});
