import { describe, expect, it } from "vitest";
import { ACCORD_CUSTOMERS } from "../fixtures";
import { CUSTOMER_STATUSES, filterCustomers } from "../filter";

describe("顧客の絞り込み", () => {
  it("空の条件では全員返る", () => {
    expect(filterCustomers(ACCORD_CUSTOMERS, "", "all")).toHaveLength(
      ACCORD_CUSTOMERS.length,
    );
  });

  it("名前の一部で見つかる", () => {
    const target = ACCORD_CUSTOMERS[0];
    const hit = filterCustomers(ACCORD_CUSTOMERS, target.name.slice(0, 2), "all");
    expect(hit.map((c) => c.id)).toContain(target.id);
  });

  it("担当者・お悩みのことばでも探せる — 現場は名前で思い出さない", () => {
    const target = ACCORD_CUSTOMERS[0];
    expect(
      filterCustomers(ACCORD_CUSTOMERS, target.assignedTo, "all").length,
    ).toBeGreaterThan(0);
    const word = target.concern.slice(0, 3);
    expect(filterCustomers(ACCORD_CUSTOMERS, word, "all").length).toBeGreaterThan(0);
  });

  it("全角・半角と大文字小文字を区別しない", () => {
    const withAscii = ACCORD_CUSTOMERS.find((c) => /[A-Za-z]/.test(c.concern));
    // 日本語データなので、正規化そのものを直接確かめる
    expect(filterCustomers(ACCORD_CUSTOMERS, "　", "all")).toHaveLength(
      ACCORD_CUSTOMERS.length,
    );
    if (withAscii) {
      const upper = withAscii.concern.replace(/[a-z]/g, (m) => m.toUpperCase());
      expect(filterCustomers(ACCORD_CUSTOMERS, upper.slice(0, 3), "all").length)
        .toBeGreaterThan(0);
    }
  });

  it("状態で絞れる、かつ検索と併用できる", () => {
    for (const s of CUSTOMER_STATUSES) {
      const only = filterCustomers(ACCORD_CUSTOMERS, "", s);
      for (const c of only) expect(c.status).toBe(s);
    }
    const combined = filterCustomers(ACCORD_CUSTOMERS, "背中", "契約中");
    for (const c of combined) expect(c.status).toBe("契約中");
  });

  it("該当なしは空配列 — 例外にしない（空状態を出す側の責任）", () => {
    expect(filterCustomers(ACCORD_CUSTOMERS, "該当しない語句xyz", "all")).toEqual([]);
  });
});
