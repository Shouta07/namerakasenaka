"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  ExternalLink,
  Link2,
  Link2Off,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import {
  CONNECT_ACKNOWLEDGEMENT,
  PARTY_LABEL,
  RESPONSIBILITY_ORDER,
  responsibilityBy,
  type ResponsibleParty,
} from "@/lib/line/responsibility";
// crypto を含む channel.ts ではなく、ブラウザ側の入口から読む。
import { validateChannelInput } from "@/lib/line/channel-input";
import {
  connectLineChannel,
  disconnectLineChannel,
  recordLineCheck,
  useHydrated,
  useStoredLineChannel,
} from "@/lib/demo/store";
import { cn } from "@/lib/utils/cn";

/**
 * 店舗が、自分の公式LINEを接続する画面。
 *
 * この画面がいちばん大事にしているのは、**責任分界を操作しながら読める**こと。
 * 契約書にだけ書いた分界は現場で守られません。
 * 「当社が代行しない」と言うなら、代行できない画面になっているべきです。
 *
 * だから:
 * - 入力欄は店舗が自分で埋める。こちらが下書きを入れない
 * - 一度保存した値は二度と表示しない（マスクと指紋だけ）
 * - 接続の前に、何を意味する操作かを1文で確認する
 */
export function LineConnectPanel({
  organizationId,
  operatorName,
}: {
  organizationId: string;
  operatorName: string;
}) {
  const hydrated = useHydrated();
  const channel = useStoredLineChannel(organizationId);

  if (!hydrated) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-5 text-[12px] text-stone-400">
        読み込み中…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {channel ? (
        <ConnectedCard
          organizationId={organizationId}
          channelId={channel.channelId}
          maskedSecret={channel.maskedSecret}
          fingerprint={channel.secretFingerprint}
          connectedAt={channel.connectedAt}
          connectedBy={channel.connectedBy}
          lastCheckedAt={channel.lastCheckedAt}
          lastCheckOk={channel.lastCheckOk}
        />
      ) : (
        <ConnectForm
          organizationId={organizationId}
          operatorName={operatorName}
        />
      )}

      <ResponsibilityTable />
    </div>
  );
}

// ---------------------------------------------------------------

function ConnectForm({
  organizationId,
  operatorName,
}: {
  organizationId: string;
  operatorName: string;
}) {
  const [channelId, setChannelId] = useState("");
  const [channelSecret, setChannelSecret] = useState("");
  const [channelAccessToken, setChannelAccessToken] = useState("");
  const [botUserId, setBotUserId] = useState("");
  const [ack, setAck] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = validateChannelInput({
      channelId,
      channelSecret,
      channelAccessToken,
    });
    if (!v.ok) {
      setErrors(v.errors as Record<string, string>);
      return;
    }
    if (!botUserId.trim()) {
      setErrors({ botUserId: "ボットのユーザーIDを入力してください。" });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const res = await fetch("/api/line/connect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          channelId,
          channelSecret,
          channelAccessToken,
          botUserId,
          acknowledged: ack,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        reason?: string;
        fields?: Record<string, string>;
        maskedSecret?: string;
        secretFingerprint?: string;
      };
      if (!res.ok || !json.ok) {
        if (json.fields) setErrors(json.fields);
        toast.error(json.reason ?? "接続できませんでした。入力内容をご確認ください。");
        return;
      }
      connectLineChannel({
        organizationId,
        channelId: channelId.trim(),
        botUserId: botUserId.trim(),
        maskedSecret: json.maskedSecret ?? "●●●●",
        secretFingerprint: json.secretFingerprint ?? "",
        connectedBy: operatorName,
      });
      // 入力欄に鍵を残さない。画面に置きっぱなしにしない。
      setChannelSecret("");
      setChannelAccessToken("");
      toast.success("公式LINEと接続しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-stone-200 bg-white p-5"
    >
      <h2 className="flex items-center gap-2 text-sm font-bold text-stone-900">
        <Link2 className="h-4 w-4 text-brand-700" aria-hidden />
        公式LINEを接続する
      </h2>
      <p className="mt-1 text-[12px] leading-relaxed text-stone-600">
        貴店の LINE 公式アカウントとつなぎます。
        入力する値は LINE Developers の管理画面から、
        <strong className="font-bold">貴店ご自身でコピーしてください</strong>。
        当社が代わりに入力することはありません。
      </p>
      <a
        href="https://developers.line.biz/console/"
        target="_blank"
        rel="noreferrer noopener"
        className="mt-2 inline-flex min-h-11 items-center gap-1 text-[12.5px] font-bold text-brand-700 hover:underline"
      >
        LINE Developers を開く
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </a>

      <div className="mt-4 space-y-4">
        <Field
          label="チャネルID"
          hint="Messaging API チャネルの Basic settings にある数字です。"
          value={channelId}
          onChange={setChannelId}
          error={errors.channelId}
          autoComplete="off"
        />
        <Field
          label="チャネルシークレット"
          hint="英数字32文字。保存後は表示されません。"
          value={channelSecret}
          onChange={setChannelSecret}
          error={errors.channelSecret}
          secret
        />
        <Field
          label="チャネルアクセストークン"
          hint="長期のトークン。保存後は表示されません。"
          value={channelAccessToken}
          onChange={setChannelAccessToken}
          error={errors.channelAccessToken}
          secret
          multiline
        />
        <Field
          label="ボットのユーザーID"
          hint="Messaging API settings の Bot basic ID の下にある「Your user ID」です。"
          value={botUserId}
          onChange={setBotUserId}
          error={errors.botUserId}
          autoComplete="off"
        />
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-2.5 rounded-xl bg-stone-50 p-3.5">
        <input
          type="checkbox"
          checked={ack}
          onChange={(e) => setAck(e.target.checked)}
          className="mt-0.5 h-5 w-5 flex-none accent-[#8c5a3c]"
        />
        <span className="text-[12.5px] leading-relaxed text-stone-700">
          {CONNECT_ACKNOWLEDGEMENT}
        </span>
      </label>

      <button
        type="submit"
        disabled={!ack || busy}
        className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand-700 px-5 text-[13px] font-bold text-white transition hover:bg-brand-500 disabled:opacity-40"
      >
        <Link2 className="h-4 w-4" aria-hidden />
        接続する
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  error,
  secret = false,
  multiline = false,
  autoComplete,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  secret?: boolean;
  multiline?: boolean;
  autoComplete?: string;
}) {
  const base =
    "mt-1.5 w-full rounded-xl border px-3 text-[13px] focus:outline-none disabled:opacity-50";
  const tone = error
    ? "border-amber-400 focus:border-amber-500"
    : "border-stone-200 focus:border-brand-500";
  return (
    <div>
      <label className="block">
        <span className="text-[12.5px] font-bold text-stone-800">{label}</span>
        {multiline ? (
          <textarea
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            // ブラウザにも保存させない。鍵を置く場所を増やさない。
            autoComplete="off"
            spellCheck={false}
            className={cn(base, tone, "py-2 font-mono")}
          />
        ) : (
          <input
            type={secret ? "password" : "text"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete={autoComplete ?? "off"}
            spellCheck={false}
            className={cn(base, tone, "h-11")}
          />
        )}
      </label>
      <p
        className={cn(
          "mt-1 text-[11.5px] leading-relaxed",
          error ? "text-amber-800" : "text-stone-500",
        )}
      >
        {error ?? hint}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------

function ConnectedCard({
  organizationId,
  channelId,
  maskedSecret,
  fingerprint,
  connectedAt,
  connectedBy,
  lastCheckedAt,
  lastCheckOk,
}: {
  organizationId: string;
  channelId: string;
  maskedSecret: string;
  fingerprint: string;
  connectedAt: string;
  connectedBy: string;
  lastCheckedAt: string | null;
  lastCheckOk: boolean | null;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <div className="rounded-2xl border border-[#cfe0cf] bg-[#f3f8f3] p-5">
      <h2 className="flex items-center gap-2 text-sm font-bold text-stone-900">
        <CheckCircle2 className="h-4 w-4 text-[#3c6347]" aria-hidden />
        公式LINEと接続しています
      </h2>

      <dl className="mt-3 space-y-2 text-[12.5px]">
        <Row label="チャネルID" value={channelId} />
        <Row label="シークレット" value={maskedSecret} />
        <Row
          label="確認用の指紋"
          value={fingerprint || "—"}
          note="入れ直した鍵が同じものかを、鍵を表示せずに確かめるための値です。"
        />
        <Row
          label="接続した日"
          value={`${new Date(connectedAt).toLocaleDateString("ja-JP")}（${connectedBy}）`}
        />
      </dl>

      <div className="mt-4 rounded-xl bg-white/70 p-3.5">
        <p className="text-[12px] font-bold text-stone-800">疎通の確認</p>
        {lastCheckedAt ? (
          <p
            className={cn(
              "mt-1 text-[12px]",
              lastCheckOk ? "text-[#3c6347]" : "text-amber-800",
            )}
          >
            {lastCheckOk ? "正常です" : "つながりませんでした"} ・{" "}
            {new Date(lastCheckedAt).toLocaleString("ja-JP")}
          </p>
        ) : (
          <p className="mt-1 text-[12px] text-stone-500">まだ確認していません。</p>
        )}
        <p className="mt-1 text-[11.5px] leading-relaxed text-stone-500">
          LINE 側でトークンを再発行すると、お知らせが静かに止まります。
          月に一度は確認してください。
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            // デモでは実際に LINE へ行かない。確認の導線だけを見せる。
            recordLineCheck(organizationId, true);
            toast.success("接続を確認しました");
            setBusy(false);
          }}
          className="mt-2 inline-flex min-h-11 items-center rounded-full border border-stone-300 bg-white px-4 text-[12.5px] font-bold text-stone-700 transition hover:border-brand-500 disabled:opacity-40"
        >
          いま確認する
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          disconnectLineChannel(organizationId);
          toast("連携を解除しました。お預かりしていた情報も削除しました。");
        }}
        className="mt-4 inline-flex min-h-11 items-center gap-1.5 px-1 text-[12.5px] font-bold text-stone-500 underline hover:text-stone-700"
      >
        <Link2Off className="h-4 w-4" aria-hidden />
        連携を解除する
      </button>
      <p className="text-[11.5px] leading-relaxed text-stone-500">
        解除すると、お預かりしているチャネル情報を削除します。
        お客様のデータは残ります。
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <dt className="w-28 flex-none text-stone-500">{label}</dt>
      <dd className="min-w-0 flex-1">
        <span className="font-mono text-stone-900">{value}</span>
        {note ? (
          <span className="mt-0.5 block font-sans text-[11.5px] leading-relaxed text-stone-500">
            {note}
          </span>
        ) : null}
      </dd>
    </div>
  );
}

// ---------------------------------------------------------------

/**
 * 責任分界。契約書の写しではなく、操作の隣に置く。
 * 店舗の責任から先に見せる（自分ごとから読み始められるように）。
 */
function ResponsibilityTable() {
  const tone: Record<ResponsibleParty, string> = {
    store: "bg-[#faf1e4] text-[#8a6a34]",
    vendor: "bg-[#e8f2e8] text-[#3c6347]",
    shared: "bg-stone-100 text-stone-600",
  };

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      <h2 className="flex items-center gap-2 text-sm font-bold text-stone-900">
        <ShieldCheck className="h-4 w-4 text-stone-500" aria-hidden />
        どちらが何を行うか
      </h2>
      <p className="mt-1 text-[12px] leading-relaxed text-stone-600">
        公式アカウントは貴店のものです。運用と同意の取得は貴店が、
        システムの安全管理は当社が行います。
      </p>

      {RESPONSIBILITY_ORDER.map((party) => (
        <div key={party} className="mt-4">
          <p className="flex items-center gap-2 text-[12px] font-bold text-stone-700">
            <span className={cn("rounded-full px-2 py-0.5 text-[11px]", tone[party])}>
              {PARTY_LABEL[party]}
            </span>
            が行うこと
          </p>
          <ul className="mt-1.5 space-y-2">
            {responsibilityBy(party).map((r) => (
              <li key={r.id} className="border-l-2 border-stone-200 pl-3">
                <p className="text-[12.5px] font-bold text-stone-800">{r.topic}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-stone-600">
                  {r.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-stone-50 p-3.5 text-[11.5px] leading-relaxed text-stone-600">
        <TriangleAlert className="mt-0.5 h-4 w-4 flex-none text-stone-400" aria-hidden />
        <span>
          検査の数値そのものを LINE でお送りすることはありません。
          お送りするのは、ご本人だけが開けるページへのリンクです。
        </span>
      </p>
    </section>
  );
}
