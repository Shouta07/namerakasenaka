import Link from "next/link";
import { RoiSimulator } from "@/components/accord/roi-simulator";

/**
 * Accord 概要 — 買う理由から並べる。
 *
 * 買い手は「血液検査を使って背中ニキビ・肌質改善をやっているサロン／クリニックの
 * オーナー」ひとりだけ。その人の困りごと → 画面 → 回収 → 始め方、の順に置く。
 * 機能の一覧は最後でいい。
 */

/** オーナーが実際に口にする困りごと。ここが自分の店の話に見えるかで、読むかどうかが決まる。 */
const PAINS = [
  {
    voice: "「検査結果を見せても、ピンと来ていない顔をされる」",
    answer:
      "検査値を「あなたの体で起きていること」と図に翻訳します。納得が、いちばん強いクロージングです。",
    href: "/accord/labtest",
    cta: "翻訳の画面を見る",
  },
  {
    voice: "「体験には来るのに、コースが決まらない。スタッフによって差が大きい」",
    answer:
      "AIのお客様相手に何度でも練習でき、成約率はスタッフ別に見えます。数字は責める道具ではなく、練習テーマを決める材料です。",
    href: "/accord/roleplay",
    cta: "接客練習を試す",
  },
  {
    voice: "「施術のあと、次に来るまでの1ヶ月が何もできない。気づけば来なくなっている」",
    answer:
      "LINEで「今日のひとつ」と経過を届け、3ヶ月後の再検査で変化を数字で見せます。続ける理由が積み上がります。",
    href: "/c/progress",
    cta: "お客様に届く画面を見る",
  },
];

/** 導入初月にやること。多いと契約されない。3つだけにする。 */
const FIRST_30_DAYS = [
  {
    when: "1週目",
    title: "検査結果を1件、翻訳してみる",
    body: "いまお持ちの検査結果を1件だけ取り込みます。所要30分。ここで「これは使える」が分かります。",
  },
  {
    when: "2〜3週目",
    title: "カウンセリングで実際に見せる",
    body: "翻訳ガイドを見せながら話し、同意をいただいた方にLINEで送ります。記録はその場で残ります。",
  },
  {
    when: "4週目",
    title: "数字を一緒に振り返る",
    body: "月1回の伴走で、成約と継続の数字を見ながら翌月の練習テーマを決めます。ここまでを無料期間で試せます。",
  },
];

export default function AccordHomePage() {
  return (
    <div className="space-y-12">
      {/* ヒーロー — 誰のための道具かを1行目で決める */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
          背中ニキビ・肌質改善 × 血液検査のサロン／クリニック専用
        </p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-stone-900 sm:text-[40px]">
          検査結果を、その場で
          <br className="sm:hidden" />
          <span className="text-brand-700">「やってみます」</span>に変える。
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-stone-600">
          Accord は、血液検査を接客に使う肌改善サロン・クリニックだけのための SaaS です。
          検査値の翻訳で成約を決め、LINEと再検査で施術後も伴走する。
          <strong className="text-stone-800">
            「施術して終わり」を終わらせ、伴走を御社の商品にします。
          </strong>
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/accord/labtest"
            className="inline-flex min-h-11 items-center rounded-full bg-brand-700 px-5 text-sm font-bold text-white transition hover:bg-brand-500"
          >
            🩸 成約が決まる画面を見る
          </Link>
          <a
            href="#roi"
            className="inline-flex min-h-11 items-center rounded-full border border-stone-300 bg-white px-5 text-sm font-bold text-stone-700 transition hover:border-brand-500"
          >
            何件で元が取れるか試算する
          </a>
        </div>
        <p className="mt-3 text-[12px] text-stone-500">
          14日間の無料トライアル（導入面談つき）。数字が出てから、有償にするか決められます。
        </p>
      </section>

      {/* 困りごと → 答え */}
      <section>
        <h2 className="text-xl font-bold text-stone-900">
          この3つ、心当たりがありませんか。
        </h2>
        <div className="mt-4 space-y-3">
          {PAINS.map((p) => (
            <div
              key={p.voice}
              className="rounded-2xl border border-stone-200 bg-white p-5 sm:flex sm:items-center sm:gap-6"
            >
              <p className="flex-1 text-[15px] font-bold leading-relaxed text-stone-900">
                {p.voice}
              </p>
              <div className="mt-2 flex-1 sm:mt-0">
                <p className="text-[13px] leading-relaxed text-stone-600">
                  {p.answer}
                </p>
                <Link
                  href={p.href}
                  className="mt-1 inline-flex min-h-11 items-center text-[12.5px] font-bold text-brand-700 hover:underline"
                >
                  {p.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 回収試算 — 買うかどうかはここで決まる */}
      <section id="roi" className="scroll-mt-24">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
          PAYBACK — 何件で元が取れるか
        </p>
        <h2 className="mt-1 text-xl font-bold text-stone-900">
          月額は、あと数件の成約で戻ります。
        </h2>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-stone-600">
          いい話だけを並べても、契約後に効きません。前提を全部出したうえで、
          御社の数字で計算してください。上乗せを 0 にすれば、差は消えます。
        </p>
        <div className="mt-4">
          <RoiSimulator />
        </div>
      </section>

      {/* 導入初月 — 怖くないことを見せる */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
          FIRST 30 DAYS — 最初の30日にやること
        </p>
        <h2 className="mt-1 text-xl font-bold text-stone-900">
          やることは、3つだけです。
        </h2>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-stone-600">
          全部の機能を使いこなす必要はありません。検査を1件、翻訳してみるところから始めます。
        </p>
        <details className="group mt-3">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-[13px] font-bold text-brand-700">
            3つの中身を見る
            <span className="ml-1 transition group-open:rotate-180" aria-hidden>
              ▾
            </span>
          </summary>
        <ol className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
          {FIRST_30_DAYS.map((s, i) => (
            <li
              key={s.when}
              className="rounded-2xl border border-stone-200 bg-white p-5"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-[11px] font-extrabold text-white">
                  {i + 1}
                </span>
                <span className="text-[11px] font-bold text-stone-400">{s.when}</span>
              </div>
              <p className="mt-2 text-[14px] font-bold text-stone-900">{s.title}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-stone-600">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
        </details>
        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-[13px] font-bold text-stone-900">
            いま使っている予約・カルテのシステムは、そのままで大丈夫です。
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-stone-600">
            Accord は記録の置き場所を取り替える道具ではありません。
            いまのやり方の上に「検査の翻訳」と「施術後の伴走」だけを足します。
            入れ替えの作業も、乗り換えの怖さもありません。
          </p>
        </div>
      </section>

    </div>
  );
}
