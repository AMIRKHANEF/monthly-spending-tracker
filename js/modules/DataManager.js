import { expensesLocalStorageKey, oldExpensesLocalStorageKey, themeLocalStorageKey } from '../constants.js';

export class DataManager {
  loadExpenses() {
    const newFormatData = localStorage.getItem(expensesLocalStorageKey);

    if (newFormatData) {
      return JSON.parse(newFormatData);
    }

    const oldFormatData = localStorage.getItem(oldExpensesLocalStorageKey);

    if (oldFormatData) {
      console.log(
        "Found old format data, migrating to Persian calendar format..."
      );
      return this.migrateExpensesToPersianDates();
    }

    return {};
  }

  saveExpenses(expenses) {
    localStorage.setItem(expensesLocalStorageKey, JSON.stringify(expenses));
  }

  loadThemeSettings() {
    const saved = localStorage.getItem(themeLocalStorageKey);

    if (saved) {
      return JSON.parse(saved);
    }

    return { enabled: false, manualTheme: null };
  }

  saveThemeSettings(enabled, manualTheme) {
    localStorage.setItem(
      themeLocalStorageKey,
      JSON.stringify({
        enabled: enabled,
        manualTheme: manualTheme,
      })
    );
  }

  migrateExpensesToPersianDates() {
    // Migration logic for old format data
    const oldData = JSON.parse(localStorage.getItem(oldExpensesLocalStorageKey) || "{}");
    const newData = {};

    // Convert old Gregorian dates to Persian dates
    Object.keys(oldData).forEach((gregorianKey) => {
      try {
        const [year, month, day] = gregorianKey.split("-").map(Number);
        const jalali = window.jalaali.toJalaali(year, month, day);
        const persianKey = `${jalali.jy}/${jalali.jm}/${jalali.jd}`;

        newData[persianKey] = oldData[gregorianKey];
      } catch (error) {
        console.warn(`Failed to migrate date ${gregorianKey}:`, error);
      }
    });

    this.saveExpenses(newData);
    return newData;
  }
}
