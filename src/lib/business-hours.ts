export type BusinessHours = {
  weekday: { open: string; close: string };
  weekend: { open: string; close: string };
};

const DEFAULT: BusinessHours = {
  weekday: { open: "10:00", close: "20:00" },
  weekend: { open: "10:00", close: "19:00" },
};

function parseHM(hm: string): [number, number] {
  const [h, m] = hm.split(":").map((s) => parseInt(s, 10));
  return [Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0];
}

export function isWithinBusinessHours(
  now: Date,
  hours: BusinessHours = DEFAULT,
): boolean {
  const day = now.getDay();
  const window = day === 0 || day === 6 ? hours.weekend : hours.weekday;
  const [openH, openM] = parseHM(window.open);
  const [closeH, closeM] = parseHM(window.close);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const openMin = openH * 60 + openM;
  const closeMin = closeH * 60 + closeM;
  return minutes >= openMin && minutes < closeMin;
}

export const AFTER_HOURS_AUTO_REPLY =
  "現在は営業時間外です。次の営業日にお返事いたします。お急ぎの場合はサロン受付までお電話ください。";
