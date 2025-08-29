import { dayNamesFa, monthNamesFa } from "../utils.js";

export class DateUtils {
  // constructor() {
  //   this.monthNamesFa = [
  //     "فروردین",
  //     "اردیبهشت",
  //     "خرداد",
  //     "تیر",
  //     "مرداد",
  //     "شهریور",
  //     "مهر",
  //     "آبان",
  //     "آذر",
  //     "دی",
  //     "بهمن",
  //     "اسفند",
  //   ]

  //   this.dayNamesFa = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"]
  // }

  formatPersianDate(jy, jm, jd) {
    return `${jd} ${monthNamesFa[jm - 1]} ${jy}`;
  }

  getPersianDayName(jy, jm, jd) {
    const gDate = window.jalaali.toGregorian(jy, jm, jd);
    const dayOfWeek = new Date(gDate.gy, gDate.gm - 1, gDate.gd).getDay();

    return dayNamesFa[dayOfWeek];
  }

  getDaysInPersianMonth(jy, jm) {
    return jm <= 6
      ? 31
      : jm <= 11
      ? 30
      : window.jalaali.isLeapJalaaliYear(jy)
      ? 30
      : 29;
  }

  isToday(jy, jm, jd) {
    const today = window.jalaali.toJalaali(new Date());
    return today.jy === jy && today.jm === jm && today.jd === jd;
  }
}
