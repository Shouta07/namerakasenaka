import { createHmac, timingSafeEqual } from "node:crypto";
import { readWebhookDestination } from "./channel-input";

// ブラウザでも要る部分は channel-input.ts に置いてある。
// サーバ側からは1か所で揃うよう、ここから通しで出す。
export {
  maskSecret,
  readWebhookDestination,
  validateChannelInput,
  describeCheck,
  type ChannelSecretInput,
  type ChannelValidation,
  type ConnectionCheck,
} from "./channel-input";

/**
 * 店舗の公式LINEとの接続（BYO-LINE）。
 *
 * 前提: 公式アカウントは**店舗のもの**。こちらは接続させてもらう側です。
 * だから設計の軸は「預かるものを最小にする」「代行しない」の2つ。
 *
 * - 鍵は**店舗自身が登録**する。こちらが代行入力しない。
 *   代行した瞬間、責任分界が曖昧になる（誰が入れた鍵か分からなくなる）。
 * - 一度保存した鍵は**二度と読み出せない**。画面にもAPIにも返さない。
 *   出せるのは「登録済み ●●●●」と、確認用のフィンガープリントだけ。
 * - Webhook は1本で受け、**署名の検証はテナントごとの鍵**で行う。
 *
 * ここは純関数だけを置く。保存も送信もしない（テストできる形に保つ）。
 */

/** 店舗ごとのチャネル設定。secret / token は保存後は読み出せない。 */
export type LineChannelConfig = {
  organizationId: string;
  /** Messaging API のチャネルID。識別子なので画面に出してよい。 */
  channelId: string;
  /**
   * 公式アカウントのボットのユーザーID。
   * Webhook 本文の destination がこれと一致する = そのテナント宛て。
   */
  botUserId: string;
  /** 店舗が自分で登録した日時。 */
  connectedAt: string;
  /** 登録したのは誰か。「店舗が自分で入れた」ことの記録。 */
  connectedBy: string;
  /** 疎通確認の最終結果。止まっていることに気づけるように。 */
  lastCheckedAt: string | null;
  lastCheckOk: boolean | null;
  /** 解除した日時。解除後は送信も受信もしない。 */
  disconnectedAt: string | null;
};

/**
 * 鍵そのものを出さずに「同じ鍵か」を確かめるための短い指紋。
 *
 * 店舗から「入れ直したけど反映されてますか」と聞かれたときに、
 * 鍵を見せずに答えられるようにするためのもの。
 * ハッシュなので、これが漏れても鍵は復元できません。
 */
export function secretFingerprint(secret: string): string {
  return createHmac("sha256", "field-cx-channel-fingerprint")
    .update(secret.trim())
    .digest("hex")
    .slice(0, 8);
}

/**
 * ログに出す前に、鍵らしき文字列を潰す。
 *
 * 鍵が漏れる最頻の経路は、攻撃ではなくエラー時のリクエストダンプです。
 * 「気をつける」ではなく、通り道に関所を置く。
 */
export function redactSecrets(text: string): string {
  return text
    .replace(/[0-9a-f]{32}/gi, "[REDACTED_SECRET]")
    .replace(/[A-Za-z0-9+/=]{100,}/g, "[REDACTED_TOKEN]");
}

// ---------------------------------------------------------------
// Webhook — テナントを引いてから、そのテナントの鍵で検証する
// ---------------------------------------------------------------

/**
 * LINE の署名を検証する。HMAC-SHA256 を base64 にしたもの。
 *
 * 比較は必ず定数時間で行う（タイミング差から鍵を推測されないため）。
 * 検証が通って、はじめて本文を信用してよい。
 */
export function verifyLineSignature(
  rawBody: string,
  signature: string | null,
  channelSecret: string,
): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", channelSecret)
    .update(rawBody, "utf8")
    .digest("base64");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  // 長さが違う時点で不一致だが、timingSafeEqual は長さが違うと投げるので先に見る。
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * 受信の入口。テナントを引く → その鍵で検証する、の順番を型で固定する。
 *
 * `lookupSecret` は destination から**そのテナントのシークレット**を返す関数。
 * テナントが見つからない（未接続・解除済み）なら null を返すこと。
 */
export type WebhookAccept =
  | { ok: true; destination: string }
  | { ok: false; reason: "no_destination" | "unknown_tenant" | "bad_signature" };

export async function acceptWebhook(
  rawBody: string,
  signature: string | null,
  lookupSecret: (destination: string) => Promise<string | null>,
): Promise<WebhookAccept> {
  const destination = readWebhookDestination(rawBody);
  if (!destination) return { ok: false, reason: "no_destination" };

  const secret = await lookupSecret(destination);
  if (!secret) return { ok: false, reason: "unknown_tenant" };

  if (!verifyLineSignature(rawBody, signature, secret)) {
    return { ok: false, reason: "bad_signature" };
  }
  return { ok: true, destination };
}

