/**
 * 同意 — 患者に見せてよいか、送ってよいかの唯一の判断点。
 *
 * 監査 B2 の「同意なし LINE 送信のサーバ強制が無い」を塞ぐための土台。
 * 画面でボタンを隠すのは親切であって、強制ではない。強制はここと API で行う。
 *
 * 設計の決めごと:
 * - 同意は**取得の記録**であって、フラグではない。誰が・いつ・何に、を必ず残す。
 * - 取り消せる。取り消したら即座に不許可（撤回の重さを、型で表す）。
 * - 目的ごとに分ける。「検査結果を自分の画面で見る」ことへの同意と、
 *   「LINE で送る」ことへの同意は別。まとめて取ると、後で説明できない。
 * - ここは純関数。保存も送信もしない。
 */

/** 同意の目的。増えるときは必ず「何に使うか」を1つに絞って足す。 */
export type ConsentScope =
  /** 検査結果を、ご本人の画面（/c/*）に表示する。 */
  | "labtest_view"
  /** 検査結果や経過を LINE で送る。 */
  | "line_share"
  /** 施術前後の写真を、ご本人の画面に表示する。 */
  | "photo_view";

export const CONSENT_SCOPE_LABEL: Record<ConsentScope, string> = {
  labtest_view: "検査結果をご自身の画面で見る",
  line_share: "経過を LINE で受け取る",
  photo_view: "施術前後の写真をご自身の画面で見る",
};

/**
 * 同意の説明文。同意を取る画面と、監査ログの両方で同じ文言を使う。
 * 「何を」「誰が見て」「いつまで」「やめられるか」を必ず含める。
 */
export const CONSENT_DESCRIPTION: Record<ConsentScope, string> = {
  labtest_view:
    "提携先で受けた検査の結果を、ご本人だけが見られるページに表示します。表示先はご本人のみで、店舗スタッフのほかに共有されることはありません。いつでも取り消せます。",
  line_share:
    "経過のまとめや次回のご案内を LINE でお送りします。検査の数値そのものは送らず、ページへのリンクのみをお送りします。いつでも取り消せます。",
  photo_view:
    "店舗で記録した施術前後の写真を、ご本人だけが見られるページに表示します。ご本人以外には共有しません。いつでも取り消せます。",
};

export type ConsentRecord = {
  id: string;
  /** 対象の患者（guide customer id）。 */
  customerId: string;
  scope: ConsentScope;
  /** 同意を得た日時（ISO）。 */
  grantedAt: string;
  /** 同意を確認したスタッフ。誰が聞いたか分からない同意は、同意ではない。 */
  grantedBy: string;
  /** 取り消した日時。null なら有効。 */
  revokedAt: string | null;
  /** どうやって同意を得たか。後から説明できるようにする。 */
  method: "店頭で口頭確認" | "同意書に署名" | "LINEで確認";
};

export type ConsentDecision = {
  ok: boolean;
  /** 断る理由。画面にも API のレスポンスにも、同じ文言をそのまま出す。 */
  reason: string | null;
};

const OK: ConsentDecision = { ok: true, reason: null };

/**
 * ある目的について、いま同意が有効かどうか。
 *
 * 「記録が無い」と「取り消された」を区別する。取り消しは、
 * もう一度お願いする前に必ず理由を確認すべき状態なので、同じ扱いにしない。
 */
export function checkConsent(
  records: ConsentRecord[],
  customerId: string,
  scope: ConsentScope,
): ConsentDecision {
  const forScope = records.filter(
    (r) => r.customerId === customerId && r.scope === scope,
  );
  if (forScope.length === 0) {
    return {
      ok: false,
      reason: `「${CONSENT_SCOPE_LABEL[scope]}」の同意をまだ確認できていません。`,
    };
  }
  // 同じ目的で複数あるときは、いちばん新しい記録が現在の意思。
  const latest = forScope
    .slice()
    .sort((a, b) => b.grantedAt.localeCompare(a.grantedAt))[0];
  if (latest.revokedAt !== null) {
    return {
      ok: false,
      reason: `「${CONSENT_SCOPE_LABEL[scope]}」の同意は取り消されています。`,
    };
  }
  return OK;
}

/**
 * 検査結果を患者の画面に出してよいか。
 * 取り込み API はこれを通らない限り 403 を返す。
 */
export function canPublishLabtest(
  records: ConsentRecord[],
  customerId: string,
): ConsentDecision {
  return checkConsent(records, customerId, "labtest_view");
}

/** LINE で送ってよいか。 */
export function canSendLine(
  records: ConsentRecord[],
  customerId: string,
): ConsentDecision {
  return checkConsent(records, customerId, "line_share");
}

/** 有効な同意だけを取り出す（同意状況の一覧表示に使う）。 */
export function activeScopes(
  records: ConsentRecord[],
  customerId: string,
): ConsentScope[] {
  const scopes: ConsentScope[] = ["labtest_view", "line_share", "photo_view"];
  return scopes.filter((s) => checkConsent(records, customerId, s).ok);
}
