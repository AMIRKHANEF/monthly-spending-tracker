export const monthNamesFa = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export const dayNamesFa = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
  "شنبه",
];

export function getPersianDayName(jy, jm, jd) {
  const gDate = window.jalaali.toGregorian(jy, jm, jd);
  const dayOfWeek = new Date(gDate.gy, gDate.gm - 1, gDate.gd).getDay();
  return this.dayNamesFa[dayOfWeek];
}

export const getDaysInMonth = (jy, jm) =>
  jm <= 6 ? 31 : jm <= 11 ? 30 : window.jalaali.isLeapJalaaliYear(jy) ? 30 : 29;

export function formatAmount(amount) {
  return new Intl.NumberFormat("fa-IR").format(amount);
}
