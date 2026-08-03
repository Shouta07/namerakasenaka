/**
 * デモか本番かを、**推測ではなく宣言**で決める。
 *
 * これまでは「Supabase の環境変数が無ければデモ」という推測だった。
 * デモとしては正しく動くが、本番でその判定に頼るのは危ない:
 * 環境変数の設定を1つ落としただけで、**アプリ全体が静かに
 * 認証なしの公開状態になる**。事故は「間違った設定」ではなく
 * 「設定し忘れ」で起きるので、そこが素通しになる設計は避ける。
 *
 * 決め方:
 *   1. `NEXT_PUBLIC_APP_MODE` が宣言されていれば、それに従う
 *   2. 宣言が無ければ、従来どおり環境変数から推測する（デモの利便性を保つ）
 *   3. **production を宣言していて土台が欠けているときは、開かずに落とす**
 *
 * 3 が肝。迷ったら閉じる。
 */

export type AppMode = "demo" | "production";

export type ModeResolution = {
  mode: AppMode;
  /** 宣言によるものか、推測によるものか。画面と診断に出す。 */
  source: "declared" | "inferred";
  /** 本番として動けない理由。あれば起動を止める。 */
  fatal: string | null;
};

export type ModeEnv = {
  appMode?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

/**
 * 純関数の本体。環境変数を引数で受けるのでテストできる。
 *
 * `fatal` が入るのは「production と宣言したのに、本番として
 * 成立しない」ときだけ。デモ宣言や推測では止めない。
 */
export function resolveAppMode(env: ModeEnv): ModeResolution {
  const declared = (env.appMode ?? "").trim().toLowerCase();
  const hasSupabase = Boolean(env.supabaseUrl && env.supabaseAnonKey);

  if (declared === "production") {
    return {
      mode: "production",
      source: "declared",
      fatal: hasSupabase
        ? null
        : "NEXT_PUBLIC_APP_MODE=production ですが、Supabase の接続情報がありません。認証なしで公開されるのを防ぐため起動を中止します。",
    };
  }

  if (declared === "demo") {
    return { mode: "demo", source: "declared", fatal: null };
  }

  if (declared !== "") {
    // 綴り間違いを「デモ」に落とさない。落とすと静かに素通しになる。
    return {
      mode: "production",
      source: "declared",
      fatal: `NEXT_PUBLIC_APP_MODE の値が不正です（"${declared}"）。demo か production を指定してください。`,
    };
  }

  // 宣言が無いときだけ推測する。デモを気軽に立てられる利便性は残す。
  return {
    mode: hasSupabase ? "production" : "demo",
    source: "inferred",
    fatal: null,
  };
}

function currentEnv(): ModeEnv {
  return {
    appMode: process.env.NEXT_PUBLIC_APP_MODE,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function appMode(): ModeResolution {
  return resolveAppMode(currentEnv());
}

/**
 * デモかどうか。既存の `isDemoMode()` はこれに委譲する。
 *
 * `fatal` があるときは **デモとして扱わない**。
 * 設定ミスで認証が外れるより、動かないほうが安全。
 */
export function isDemoModeResolved(): boolean {
  const r = appMode();
  if (r.fatal) return false;
  return r.mode === "demo";
}
