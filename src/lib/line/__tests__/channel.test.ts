import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  acceptWebhook,
  describeCheck,
  maskSecret,
  readWebhookDestination,
  redactSecrets,
  secretFingerprint,
  validateChannelInput,
  verifyLineSignature,
} from "../channel";
import {
  CONNECT_ACKNOWLEDGEMENT,
  RESPONSIBILITY,
  responsibilityBy,
} from "../responsibility";
import { containsBannedWord } from "@/lib/compliance/banned-words";

const SECRET = "0123456789abcdef0123456789abcdef";
const TOKEN = "x".repeat(150);

function sign(body: string, secret = SECRET): string {
  return createHmac("sha256", secret).update(body, "utf8").digest("base64");
}

describe("validateChannelInput — 保存前に形だけ見る", () => {
  it("正しい形は通る", () => {
    const v = validateChannelInput({
      channelId: "1234567890",
      channelSecret: SECRET,
      channelAccessToken: TOKEN,
    });
    expect(v.ok).toBe(true);
    expect(v.errors).toEqual({});
  });

  it("空欄はそれぞれ指摘する", () => {
    const v = validateChannelInput({});
    expect(v.ok).toBe(false);
    expect(Object.keys(v.errors).sort()).toEqual([
      "channelAccessToken",
      "channelId",
      "channelSecret",
    ]);
  });

  it("チャネルIDに数字以外が混ざったら、どこから取るかを教える", () => {
    const v = validateChannelInput({
      channelId: "abc123",
      channelSecret: SECRET,
      channelAccessToken: TOKEN,
    });
    expect(v.errors.channelId).toContain("LINE Developers");
  });

  it("シークレットの長さ違いを弾く", () => {
    const v = validateChannelInput({
      channelId: "1234567890",
      channelSecret: "tooshort",
      channelAccessToken: TOKEN,
    });
    expect(v.errors.channelSecret).toBeTruthy();
  });

  it("途中で切れたトークンは「切れていないか」を尋ねる", () => {
    const v = validateChannelInput({
      channelId: "1234567890",
      channelSecret: SECRET,
      channelAccessToken: "short",
    });
    expect(v.errors.channelAccessToken).toContain("切れていないか");
  });
});

describe("預かったものを、そのまま出さない", () => {
  it("マスクは末尾4文字しか残さない", () => {
    const masked = maskSecret(SECRET);
    expect(masked).toContain(SECRET.slice(-4));
    expect(masked).not.toContain(SECRET.slice(0, 8));
  });

  it("未登録は未登録と出す（●で誤魔化さない）", () => {
    expect(maskSecret("")).toBe("未登録");
  });

  it("極端に短い値でも中身を出さない", () => {
    expect(maskSecret("ab")).toBe("●●●●");
  });

  it("指紋は同じ鍵で同じ、違う鍵で違う", () => {
    expect(secretFingerprint(SECRET)).toBe(secretFingerprint(SECRET));
    expect(secretFingerprint(SECRET)).not.toBe(
      secretFingerprint("f".repeat(32)),
    );
  });

  it("指紋から鍵は読めない（長さも中身も残らない）", () => {
    const fp = secretFingerprint(SECRET);
    expect(fp).toHaveLength(8);
    expect(SECRET).not.toContain(fp);
  });

  it("ログに落ちる前にシークレットを潰す", () => {
    const line = `POST /api/line failed body={"channelSecret":"${SECRET}"}`;
    expect(redactSecrets(line)).not.toContain(SECRET);
    expect(redactSecrets(line)).toContain("[REDACTED_SECRET]");
  });

  it("ログに落ちる前にアクセストークンも潰す", () => {
    expect(redactSecrets(`token=${TOKEN}`)).toContain("[REDACTED_TOKEN]");
  });
});

describe("verifyLineSignature", () => {
  const body = JSON.stringify({ destination: "U1", events: [] });

  it("正しい署名を受け入れる", () => {
    expect(verifyLineSignature(body, sign(body), SECRET)).toBe(true);
  });

  it("署名が無ければ拒否する", () => {
    expect(verifyLineSignature(body, null, SECRET)).toBe(false);
  });

  it("本文を1文字でも変えたら拒否する", () => {
    const s = sign(body);
    expect(verifyLineSignature(body + " ", s, SECRET)).toBe(false);
  });

  it("別のテナントの鍵で署名されたものを拒否する", () => {
    const other = "f".repeat(32);
    expect(verifyLineSignature(body, sign(body, other), SECRET)).toBe(false);
  });

  it("長さの違う署名でも例外を投げず false を返す", () => {
    expect(verifyLineSignature(body, "short", SECRET)).toBe(false);
  });
});

describe("readWebhookDestination — 検証前に読むのは宛先だけ", () => {
  it("destination を取り出す", () => {
    expect(readWebhookDestination('{"destination":"Uabc","events":[]}')).toBe(
      "Uabc",
    );
  });

  it("壊れた JSON では null（例外を投げない）", () => {
    expect(readWebhookDestination("{oops")).toBeNull();
  });

  it("destination が無ければ null", () => {
    expect(readWebhookDestination('{"events":[]}')).toBeNull();
  });

  it("destination が文字列でなければ null", () => {
    expect(readWebhookDestination('{"destination":123}')).toBeNull();
  });
});

describe("acceptWebhook — テナントを引いてから、その鍵で検証する", () => {
  const body = JSON.stringify({ destination: "Ustore1", events: [] });
  const lookup = async (d: string) => (d === "Ustore1" ? SECRET : null);

  it("正しい署名なら受け入れる", async () => {
    const r = await acceptWebhook(body, sign(body), lookup);
    expect(r).toEqual({ ok: true, destination: "Ustore1" });
  });

  it("未接続のテナント宛ては拒否する", async () => {
    const other = JSON.stringify({ destination: "Uunknown", events: [] });
    const r = await acceptWebhook(other, sign(other), lookup);
    expect(r).toEqual({ ok: false, reason: "unknown_tenant" });
  });

  it("宛先が無ければ、鍵を引きにすら行かない", async () => {
    let called = false;
    const spy = async (d: string) => {
      called = true;
      return lookup(d);
    };
    const r = await acceptWebhook("{}", "sig", spy);
    expect(r).toEqual({ ok: false, reason: "no_destination" });
    expect(called).toBe(false);
  });

  it("他店舗の鍵で署名された偽イベントを拒否する", async () => {
    const forged = sign(body, "f".repeat(32));
    const r = await acceptWebhook(body, forged, lookup);
    expect(r).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("署名が無い生の POST を拒否する", async () => {
    const r = await acceptWebhook(body, null, lookup);
    expect(r).toEqual({ ok: false, reason: "bad_signature" });
  });
});

describe("describeCheck — 店舗が動ける言葉にする", () => {
  it("成功はそう伝える", () => {
    expect(describeCheck(200).ok).toBe(true);
  });

  it.each([401, 403, 429, 500])("%d でも次にやることを書く", (status) => {
    const c = describeCheck(status);
    expect(c.ok).toBe(false);
    expect(c.message.length).toBeGreaterThan(15);
  });

  it("401 は再発行を案内する（原因が分かる文言）", () => {
    expect(describeCheck(401).message).toContain("発行し直して");
  });
});

describe("責任分界の表", () => {
  it("店舗・当社・両方のすべてに項目がある（片側だけの表にしない）", () => {
    expect(responsibilityBy("store").length).toBeGreaterThan(0);
    expect(responsibilityBy("vendor").length).toBeGreaterThan(0);
    expect(responsibilityBy("shared").length).toBeGreaterThan(0);
  });

  it("システムの安全管理は当社が負う（委託先の義務は契約で消せない）", () => {
    const item = RESPONSIBILITY.find((r) => r.id === "platform-security");
    expect(item?.party).toBe("vendor");
  });

  it("チャネル情報の登録は店舗が行う（当社は代行しない）", () => {
    const item = RESPONSIBILITY.find((r) => r.id === "credentials");
    expect(item?.party).toBe("store");
    expect(item?.detail).toContain("代行");
  });

  it("漏えい対応は片方に寄せない", () => {
    expect(RESPONSIBILITY.find((r) => r.id === "incident")?.party).toBe("shared");
  });

  it("idが重複していない", () => {
    const ids = RESPONSIBILITY.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("画面に出る文言がすべて §8.2 の禁止語を通る", () => {
    const texts = [
      CONNECT_ACKNOWLEDGEMENT,
      ...RESPONSIBILITY.flatMap((r) => [r.topic, r.detail]),
    ];
    for (const t of texts) {
      expect(containsBannedWord(t).hits, t).toEqual([]);
    }
  });
});
