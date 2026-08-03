import { containsBannedWord } from "@/lib/compliance/banned-words";
import { canSendLine, type ConsentRecord } from "@/lib/labtest/consent";

/**
 * LINE でメッセージを送る。
 *
 * 送る前に必ず3つの関門を通す。どれも「送ってしまってから気づく」と
 * 取り返しがつかないものなので、送信関数の中に閉じ込める。
 *
 *   1. **同意** — `line_share` の同意が無ければ送らない
 *   2. **中身** — 検査の数値そのものを本文に入れない。送るのはリンクだけ
 *   3. **表現** — 薬機法・医療広告の禁止語を通す
 *
 * 2 が要点。トーク履歴は端末に残り、家族に見られることもあり、
 * 退会後も消せない。**数値を LINE に置かない**かぎり事故の面積は小さい。
 */

export type SendDecision =
  | { ok: true; text: string }
  | { ok: false; reason: string };

/** 検査値らしき文字列。数値＋単位が本文に紛れ込んでいないか見る。 */
const LAB_UNIT = /\d+(\.\d+)?\s*(ng\/ml|μg\/dl|ug\/dl|mg\/dl|g\/dl|u\/l|iu\/l|nmol\/ml|nmol\/l|%)/i;

/**
 * 送ってよいかを判定し、送る本文を返す。**純関数**。
 * 実際の送信はしない（テストできる形に保つ）。
 */
export function prepareLineMessage(input: {
  customerId: string;
  consents: ConsentRecord[];
  text: string;
}): SendDecision {
  const consent = canSendLine(input.consents, input.customerId);
  if (!consent.ok) {
    return { ok: false, reason: consent.reason ?? "同意が確認できません。" };
  }

  const text = input.text.trim();
  if (text === "") {
    return { ok: false, reason: "本文が空です。" };
  }
  if (text.length > 400) {
    return {
      ok: false,
      reason: "本文が長すぎます（400文字まで）。ページへのリンクでお伝えください。",
    };
  }

  if (LAB_UNIT.test(text)) {
    return {
      ok: false,
      reason:
        "検査の数値は LINE でお送りしません。ご本人のページへのリンクをお送りしてください。",
    };
  }

  const banned = containsBannedWord(text);
  if (!banned.ok) {
    return {
      ok: false,
      reason: `使用できない表現が含まれています（${banned.hits.join("、")}）。`,
    };
  }

  return { ok: true, text };
}

/**
 * 週次のふりかえりを促す本文。
 * 数値は入れず、ページへの導線だけを渡す。
 */
export function weeklyCheckinText(name: string, pageUrl: string): string {
  return [
    `${name} 様`,
    "",
    "今週もおつかれさまでした。ふりかえりのご記入をお願いします（30秒ほどです）。",
    "答えにくい項目は飛ばしていただいて大丈夫です。",
    "",
    pageUrl,
  ].join("\n");
}

/** 検査結果を公開したときのお知らせ。数値は書かない。 */
export function labPublishedText(name: string, pageUrl: string): string {
  return [
    `${name} 様`,
    "",
    "検査の結果を、ご本人のページでご覧いただけるようにしました。",
    "数値の意味と、今日からできることをまとめています。",
    "",
    pageUrl,
  ].join("\n");
}

// ---------------------------------------------------------------
// 実際の送信
// ---------------------------------------------------------------

export type PushResult = { ok: true } | { ok: false; status: number; reason: string };

/**
 * Messaging API の push。**店舗のトークン**で、店舗の名前で送る。
 *
 * 失敗の理由は現場が動ける言葉に翻訳する。「401」とだけ返しても、
 * 店舗はトークンを再発行すればよいと分からない。
 */
export async function pushLineMessage(
  channelAccessToken: string,
  lineUserId: string,
  text: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PushResult> {
  const res = await fetchImpl("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [{ type: "text", text }],
    }),
  });

  if (res.ok) return { ok: true };

  const reason =
    res.status === 401
      ? "アクセストークンが受け付けられませんでした。LINE Developers で発行し直し、連携画面で登録し直してください。"
      : res.status === 403
        ? "送信の権限がありませんでした。Messaging API のチャネルであることをご確認ください。"
        : res.status === 429
          ? "LINE 側の送信上限に達しています。時間をおいてからお試しください。"
          : `送信できませんでした（応答 ${res.status}）。`;
  return { ok: false, status: res.status, reason };
}
