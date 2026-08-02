/**
 * 責任分界 — 誰が何に責任を持つか。
 *
 * 契約書にだけ書いた分界は、現場では守られません。
 * 同じ内容を**接続の画面にも出す**ことで、はじめて分界が実体になります。
 * 「読んだことになっている」ではなく「見ながら操作した」にするため。
 *
 * この表がそのまま画面に出るので、法務の文章ではなく、
 * 現場が読んで意味の分かる言葉で書くこと。
 *
 * ※ 個人情報保護法上、当社は店舗（個人情報取扱事業者）の委託先にあたります。
 *   契約で分界を決めても、**委託先自身の安全管理措置義務は消えません**。
 *   この表は当事者間の役割分担であって、法令上の義務の免除ではない、
 *   という前提で書いています。
 */

export type ResponsibleParty = "store" | "vendor" | "shared";

export const PARTY_LABEL: Record<ResponsibleParty, string> = {
  store: "店舗",
  vendor: "当社",
  shared: "両方",
};

export type ResponsibilityItem = {
  id: string;
  /** 何についての話か。 */
  topic: string;
  party: ResponsibleParty;
  /** 具体的に何をするのか。曖昧な言葉を使わない。 */
  detail: string;
};

export const RESPONSIBILITY: ResponsibilityItem[] = [
  {
    id: "oa-contract",
    topic: "LINE公式アカウントの契約と利用料",
    party: "store",
    detail:
      "公式アカウントは店舗さまのものです。契約・プラン・メッセージの通信料は店舗さまのご負担になります。",
  },
  {
    id: "credentials",
    topic: "チャネル情報の登録",
    party: "store",
    detail:
      "チャネルID・シークレット・アクセストークンは、店舗さまご自身でご登録ください。当社が代行して入力することはありません。",
  },
  {
    id: "credential-storage",
    topic: "登録された情報の保管",
    party: "vendor",
    detail:
      "お預かりした情報は暗号化して保管し、画面にも記録にも元の値を表示しません。連携を解除すると削除します。",
  },
  {
    id: "oa-operation",
    topic: "公式アカウントの運用",
    party: "store",
    detail:
      "リッチメニューの内容、スタッフからの個別メッセージ、友だち追加時のあいさつなど、アカウントの運用は店舗さまの管理下にあります。",
  },
  {
    id: "consent",
    topic: "お客様からの同意の取得",
    party: "store",
    detail:
      "検査結果の表示やLINEでのご連絡について、お客様から同意をいただくのは店舗さまです。当社はその記録を残す仕組みを提供します。",
  },
  {
    id: "data-accuracy",
    topic: "取り込んだ検査データの内容",
    party: "store",
    detail:
      "読み取り結果が検査票と合っているかの確認は、公開前に店舗さまが行ってください。当社は読み取れなかった行を省略せずに表示します。",
  },
  {
    id: "staff-accounts",
    topic: "スタッフのアカウント管理",
    party: "store",
    detail:
      "スタッフの追加・削除、退職者の権限の停止は店舗さまで行ってください。誰が操作したかの記録は当社が残します。",
  },
  {
    id: "platform-security",
    topic: "システムの安全管理",
    party: "vendor",
    detail:
      "サーバ・データベース・通信の安全管理、脆弱性への対応、バックアップは当社が行います。",
  },
  {
    id: "incident",
    topic: "万一の情報漏えいへの対応",
    party: "shared",
    detail:
      "原因の調査と技術的な資料の作成は当社が行い、監督官庁への報告とお客様へのご連絡は店舗さまが行います。どちらが原因でも、当社は調査に必要な記録を提供します。",
  },
  {
    id: "line-outage",
    topic: "LINE側の障害・仕様変更",
    party: "shared",
    detail:
      "LINE側の障害や仕様変更による停止について、当社は復旧の責任を負いかねます。停止を検知して店舗さまにお知らせする仕組みは当社が用意します。",
  },
];

/** 画面の並び順。店舗の責任を先に見せる（自分ごとから読み始められるように）。 */
export const RESPONSIBILITY_ORDER: ResponsibleParty[] = [
  "store",
  "vendor",
  "shared",
];

export function responsibilityBy(party: ResponsibleParty): ResponsibilityItem[] {
  return RESPONSIBILITY.filter((r) => r.party === party);
}

/**
 * 接続の直前に、店舗に確認していただく一文。
 *
 * チェックボックスに添える文言。長い規約を読ませるのではなく、
 * **いま押そうとしているボタンが何を意味するか**だけを書く。
 */
export const CONNECT_ACKNOWLEDGEMENT =
  "この公式アカウントは当店のものであり、チャネル情報を当店の判断で登録することを確認しました。";
