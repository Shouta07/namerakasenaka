import type { VitalityDesignCustomer } from "./fixtures";

export type CustomerStatus = VitalityDesignCustomer["status"];
export const CUSTOMER_STATUSES: CustomerStatus[] = ["契約中", "提案中", "体験予約"];

/**
 * 顧客の絞り込み。8人なら一覧で足りるが、80人になると破綻する。
 * 名前・担当・悩み・次のアクションまで拾う — 現場は「あの背中の人」で探す。
 */
export function filterCustomers(
  list: VitalityDesignCustomer[],
  query: string,
  status: CustomerStatus | "all",
): VitalityDesignCustomer[] {
  const q = query.trim().normalize("NFKC").toLowerCase();
  return list.filter((c) => {
    if (status !== "all" && c.status !== status) return false;
    if (!q) return true;
    const hay = [c.name, c.assignedTo, c.concern, c.nextAction, c.statusNote]
      .join(" ")
      .normalize("NFKC")
      .toLowerCase();
    return hay.includes(q);
  });
}
