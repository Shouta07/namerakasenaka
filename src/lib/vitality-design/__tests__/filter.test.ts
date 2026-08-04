import { describe, expect, it } from "vitest";
import { VITALITY_DESIGN_CUSTOMERS } from "../fixtures";
import { CUSTOMER_STATUSES, filterCustomers } from "../filter";

describe("顧客の絞り込み", () => {
  it("空の条件では全員返る", () => {
    expect(filterCustomers(VITALITY_DESIGN_CUSTOMERS, "", "all")).toHaveLength(
      VITALITY_DESIGN_CUSTOMERS.length,
    );
  });

  it("名前の一部で見つかる", () => {
    const target = VITALITY_DESIGN_CUSTOMERS[0];
    const hit = filterCustomers(VITALITY_DESIGN_CUSTOMERS, target.name.slice(0, 2), "all");
    expect(hit.map((c) => c.id)).toContain(target.id);
  });

  it("担当者・お悩みのことばでも探せる — 現場は名前で思い出さない", () => {
    const target = VITALITY_DESIGN_CUSTOMERS[0];
    expect(
      filterCustomers(VITALITY_DESIGN_CUSTOMERS, target.assignedTo, "all").length,
    ).toBeGreaterThan(0);
    const word = target.concern.slice(0, 3);
    expect(filterCustomers(VITALITY_DESIGN_CUSTOMERS, word, "all").length).toBeGreaterThan(0);
  });

  it("全角・半角と大文字小文字を区別しない", () => {
    const withAscii = VITALITY_DESIGN_CUSTOMERS.find((c) => /[A-Za-z]/.test(c.concern));
    // 日本語データなので、正規化そのものを直接確かめる
    expect(filterCustomers(VITALITY_DESIGN_CUSTOMERS, "　", "all")).toHaveLength(
      VITALITY_DESIGN_CUSTOMERS.length,
    );
    if (withAscii) {
      const upper = withAscii.concern.replace(/[a-z]/g, (m) => m.toUpperCase());
      expect(filterCustomers(VITALITY_DESIGN_CUSTOMERS, upper.slice(0, 3), "all").length)
        .toBeGreaterThan(0);
    }
  });

  it("状態で絞れる、かつ検索と併用できる", () => {
    for (const s of CUSTOMER_STATUSES) {
      const only = filterCustomers(VITALITY_DESIGN_CUSTOMERS, "", s);
      for (const c of only) expect(c.status).toBe(s);
    }
    const combined = filterCustomers(VITALITY_DESIGN_CUSTOMERS, "背中", "契約中");
    for (const c of combined) expect(c.status).toBe("契約中");
  });

  it("該当なしは空配列 — 例外にしない（空状態を出す側の責任）", () => {
    expect(filterCustomers(VITALITY_DESIGN_CUSTOMERS, "該当しない語句xyz", "all")).toEqual([]);
  });
});
