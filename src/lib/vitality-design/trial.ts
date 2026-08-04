/**
 * お試し（トライアル）。
 *
 * 想定している流れ:
 *   資料請求が届く → 資料と一緒にお試しリンクを送る
 *   → 相手が開く → 登録なしですぐ触れる → 導入の相談へ
 *
 * 設計の軸は「相手に何も要求しない」。
 *
 * - **アカウント登録なし**。リンクを開いたら、その場で触れる
 * - **設定なし**。LINE の接続も Supabase も要らない
 * - **データはその端末から出ない**。ブラウザの中だけで動く
 *
 * 3つめが、この商品ではとくに重い。
 * 試用のお客様は、実際の患者さんの検査票を持っています。
 * それを落として試したくなるのが自然で、そのとき
 * 「契約前の会社に患者データを渡してよいのか」という不安が必ず立つ。
 * **答えは「渡していません」**。値はブラウザから出ません。
 * それを口約束ではなく、画面に書いて、実装でも守ります。
 */

export type TrialStart = "sample" | "empty";

export const TRIAL_START_OPTIONS: {
  id: TrialStart;
  label: string;
  detail: string;
}[] = [
  {
    id: "sample",
    label: "サンプルで見てみる",
    detail:
      "架空の患者さん1名分が入った状態から始めます。何ができるかを3分で確認できます。",
  },
  {
    id: "empty",
    label: "まっさらから試す",
    detail:
      "導入初日と同じ、何も無い状態から始めます。実際の運用に近い手触りを確かめられます。",
  },
];

/**
 * お試し中に、相手へ約束すること。
 *
 * 画面にそのまま出す。ここに書いたことは実装で守られている必要がある
 * （守れないものは、書かない）。
 */
export const TRIAL_PROMISES = [
  {
    id: "no-account",
    label: "登録は要りません",
    detail: "メールアドレスもパスワードも不要です。このまま触っていただけます。",
  },
  {
    id: "stays-local",
    label: "入力したデータは、この端末から出ません",
    detail:
      "検査の数値は、お使いのブラウザの中だけに保存されます。当社のサーバーには送信していません。実際の患者さんの検査票でお試しいただいて構いません。",
  },
  {
    id: "erasable",
    label: "いつでも消せます",
    detail:
      "「お試しデータを消す」でその場から消えます。ブラウザの履歴を消しても同じです。",
  },
  {
    id: "no-line",
    label: "LINEの接続は要りません",
    detail:
      "お試しでは実際の送信を行いません。貴店の公式アカウントに触れることはありません。",
  },
] as const;

/**
 * お試しで見ていただきたい順路。
 *
 * 「自由に触ってください」では、価値のある画面にたどり着かないまま終わります。
 * 3分で山場（検査が図になる瞬間）まで運ぶ。
 */
export const TRIAL_STEPS = [
  {
    n: 1,
    title: "検査結果を取り込む",
    body: "検査票のファイルを枠に落とすか、表をコピーして貼り付けます。読み取れた項目と、読み取れなかった行が並びます。",
    href: "/admin/customers",
    cta: "取り込みを試す",
  },
  {
    n: 2,
    title: "同意を確認して公開する",
    body: "同意の記録がないと公開できません。記録してから「ご本人の画面に表示する」を押します。",
    href: "/admin/customers",
    cta: "同じ画面で続けます",
  },
  {
    n: 3,
    title: "患者さんの画面を見る",
    body: "数値が「6つの力」の図になり、項目ごとに意味と次の一歩が並びます。ここが、お客様にお見せするものです。",
    href: "/c/guide",
    cta: "患者さんの画面へ",
  },
] as const;

/** お試しの期間。過ぎたら切れるのではなく、こちらから声をかける目安。 */
export const TRIAL_DAYS = 14;

const KEY = "vitality-design-trial";

export type TrialState = {
  startedAt: string;
  start: TrialStart;
};

export function readTrial(): TrialState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TrialState) : null;
  } catch {
    return null;
  }
}

export function startTrial(start: TrialStart): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ startedAt: new Date().toISOString(), start }),
    );
  } catch {
    // 保存できなくてもお試し自体は続けられる。黙って進む。
  }
}

export function endTrial(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // 同上
  }
}

/** 開始から何日目か。1日目から数える。 */
export function trialDay(state: TrialState, now: Date): number {
  const ms = now.getTime() - new Date(state.startedAt).getTime();
  return Math.max(1, Math.floor(ms / 86_400_000) + 1);
}

export function trialDaysLeft(state: TrialState, now: Date): number {
  return Math.max(0, TRIAL_DAYS - trialDay(state, now) + 1);
}
