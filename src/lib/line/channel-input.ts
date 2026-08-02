/**
 * 店舗の公式LINEとの接続のうち、**ブラウザでも動く部分**。
 *
 * 署名の検証と指紋の計算は node:crypto を使うので channel.ts に置いてある。
 * 接続の入力フォームはクライアントコンポーネントなので、
 * そこから crypto を引きずり込まないよう、ここに分けている。
 *
 * ここに秘密を扱う処理を足さないこと。ここはクライアントに配られる。
 */

export type ChannelSecretInput = {
  channelId: string;
  channelSecret: string;
  channelAccessToken: string;
};

// ---------------------------------------------------------------
// 入力の検証 — 保存する前に、形だけは見る
// ---------------------------------------------------------------

export type ChannelValidation = {
  ok: boolean;
  /** 項目ごとの指摘。画面のその欄の下にそのまま出す。 */
  errors: Partial<Record<keyof ChannelSecretInput, string>>;
};

/**
 * 形が明らかにおかしいものを、保存前に弾く。
 *
 * ここで「正しい鍵かどうか」は判定できません（LINE に聞かないと分からない）。
 * 判定できるのは「明らかに違うものが貼られていないか」だけ。
 * だから保存後に必ず疎通確認を通す設計にしています。
 */
export function validateChannelInput(
  input: Partial<ChannelSecretInput>,
): ChannelValidation {
  const errors: ChannelValidation["errors"] = {};

  const id = (input.channelId ?? "").trim();
  if (id === "") {
    errors.channelId = "チャネルIDを入力してください。";
  } else if (!/^\d{8,12}$/.test(id)) {
    errors.channelId = "チャネルIDは数字のみです。LINE Developers の Basic settings からコピーしてください。";
  }

  const secret = (input.channelSecret ?? "").trim();
  if (secret === "") {
    errors.channelSecret = "チャネルシークレットを入力してください。";
  } else if (!/^[0-9a-f]{32}$/i.test(secret)) {
    errors.channelSecret = "チャネルシークレットの形式が違うようです（英数字32文字）。";
  }

  const token = (input.channelAccessToken ?? "").trim();
  if (token === "") {
    errors.channelAccessToken = "アクセストークンを入力してください。";
  } else if (token.length < 100) {
    errors.channelAccessToken = "アクセストークンが短すぎます。途中で切れていないかご確認ください。";
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

// ---------------------------------------------------------------
// 表示 — 預かったものを、絶対にそのまま出さない
// ---------------------------------------------------------------

export function maskSecret(secret: string): string {
  const s = secret.trim();
  if (s.length === 0) return "未登録";
  if (s.length <= 4) return "●●●●";
  return `●●●●●●●● ${s.slice(-4)}`;
}

/**
 * Webhook 本文から、宛先のボットを取り出す。
 *
 * **重要**: この時点の本文は、まだ一切信用できません。
 * 署名を検証するために、どのテナントの鍵を使うかを知る必要があり、
 * そのためだけに本文を先に読んでいます。
 * ここで得た destination は「鍵を引くためのキー」以外に使わないこと。
 */
export function readWebhookDestination(rawBody: string): string | null {
  try {
    const parsed = JSON.parse(rawBody) as { destination?: unknown };
    const d = parsed.destination;
    return typeof d === "string" && d.length > 0 ? d : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------
// 疎通確認
// ---------------------------------------------------------------

export type ConnectionCheck = {
  ok: boolean;
  /** 店舗にそのまま見せる文言。原因と、次にやることを書く。 */
  message: string;
};

/**
 * 疎通確認の結果を、店舗が動ける言葉に翻訳する。
 *
 * 「401」とだけ出しても現場は何もできません。
 * 誰が何をすれば直るのかを書く。
 */
export function describeCheck(status: number): ConnectionCheck {
  if (status >= 200 && status < 300) {
    return { ok: true, message: "接続できました。LINE公式アカウントと連携しています。" };
  }
  if (status === 401) {
    return {
      ok: false,
      message:
        "アクセストークンが受け付けられませんでした。再発行された可能性があります。LINE Developers で発行し直して、登録し直してください。",
    };
  }
  if (status === 403) {
    return {
      ok: false,
      message:
        "権限がありませんでした。Messaging API のチャネルであること、利用プランをご確認ください。",
    };
  }
  if (status === 429) {
    return {
      ok: false,
      message: "LINE側の制限に達しています。しばらく時間をおいて、もう一度お試しください。",
    };
  }
  return {
    ok: false,
    message: `接続を確認できませんでした（応答 ${status}）。時間をおいても直らない場合はご連絡ください。`,
  };
}
