import { CulturalThemes } from "./CulturalThemes.js";
import { CalendarManager } from "./CalendarManager.js";
import { ExpenseManager } from "./ExpenseManager.js";
import { UIManager } from "./UIManager/UIManager.js";
import { DataManager } from "./DataManager.js";
import { DateUtils } from "./DateUtils.js";
import recentExpenses from "./UIManager/RecentExpenses.js";
import showNotification from "./UIManager/ShowNotification.js";

export class SpendingTracker {
  constructor() {
    this.currentJalaliDate = window.jalaali.toJalaali(new Date());

    // Initialize managers
    this.culturalThemes = new CulturalThemes();
    this.dataManager = new DataManager();
    this.expenseManager = new ExpenseManager(this.dataManager);
    this.calendarManager = new CalendarManager(
      this.currentJalaliDate,
      this.expenseManager
    );
    this.uiManager = new UIManager(this);
    this.dateUtils = new DateUtils();

    // Load data
    this.expenses = this.dataManager.loadExpenses();
    this.themeSettings = this.dataManager.loadThemeSettings();
    this.isThemeEnabled = this.themeSettings.enabled;
    this.manualTheme = this.themeSettings.manualTheme;

    this.init();
  }

  init() {
    this.applyCurrentTheme();
    this.updateDisplay();
    this.uiManager.bindEvents();
    this.calendarManager.renderCalendar();
    this.renderRecentExpenses();
  }

  applyCurrentTheme() {
    const theme = this.getEffectiveTheme();
    this.culturalThemes.applyTheme(theme);
  }

  getEffectiveTheme() {
    if (!this.isThemeEnabled) {
      return this.culturalThemes.getDefaultTheme();
    }

    if (this.manualTheme) {
      return this.culturalThemes.getTheme(this.manualTheme);
    }

    return this.culturalThemes.getCurrentTheme(this.currentJalaliDate);
  }

  updateDisplay() {
    this.uiManager.updateMonthDisplay(this.currentJalaliDate);
    this.uiManager.updateSummary(
      this.getCurrentMonthTotal(),
      this.getCurrentMonthDailyAverage()
    );
  }

  getCurrentMonthTotal() {
    return this.expenseManager.getMonthTotal(this.currentJalaliDate);
  }

  getCurrentMonthDailyAverage() {
    return this.expenseManager.getDailyAverage(this.currentJalaliDate);
  }

  renderRecentExpenses() {
    const monthExpenses = this.expenseManager.getCurrentMonthExpenses(
      this.currentJalaliDate
    );

    recentExpenses(monthExpenses);
  }

  // Navigation methods
  navigateMonth(direction) {
    if (direction === "next") {
      if (this.currentJalaliDate.jm === 12) {
        this.currentJalaliDate.jy++;
        this.currentJalaliDate.jm = 1;
      } else {
        this.currentJalaliDate.jm++;
      }
    } else {
      if (this.currentJalaliDate.jm === 1) {
        this.currentJalaliDate.jy--;
        this.currentJalaliDate.jm = 12;
      } else {
        this.currentJalaliDate.jm--;
      }
    }

    this.applyCurrentTheme();
    this.updateDisplay();
    this.calendarManager.updateDate(this.currentJalaliDate);
    this.calendarManager.renderCalendar();
    this.renderRecentExpenses();
  }

  // Expense methods
  addExpense(amount, description) {
    const success = this.expenseManager.addExpense(
      amount,
      description,
      this.currentJalaliDate
    );

    if (success) {
      this.updateDisplay();
      this.calendarManager.renderCalendar();
      this.renderRecentExpenses();
      this.uiManager.clearExpenseForm();
    }

    return success;
  }

  removeExpense(persianDate, expenseId) {
    const success = this.expenseManager.removeExpense(persianDate, expenseId);

    if (success) {
      this.updateDisplay();
      this.calendarManager.renderCalendar();
      this.renderRecentExpenses();
    }

    return success;
  }

  // Theme methods
  toggleTheme() {
    this.isThemeEnabled = !this.isThemeEnabled;
    this.dataManager.saveThemeSettings(this.isThemeEnabled, this.manualTheme);
    this.applyCurrentTheme();

    this.uiManager.showThemeSelector(this, showNotification);
  }

  setManualTheme(themeName) {
    this.manualTheme = themeName;
    this.dataManager.saveThemeSettings(this.isThemeEnabled, this.manualTheme);
    this.applyCurrentTheme();
  }

  // Update theme button appearance
  updateThemeButton() {
    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
      const currentTheme = this.getEffectiveTheme();
      const isAuto = this.isThemeEnabled && !this.manualTheme;

      if (!this.isThemeEnabled) {
        themeBtn.innerHTML = "🎨";
        themeBtn.title = "فعال‌سازی تم‌های فرهنگی";
      } else if (isAuto) {
        themeBtn.innerHTML = "🌟";
        themeBtn.title = `تم خودکار: ${currentTheme.name}`;
      } else {
        themeBtn.innerHTML = "🎭";
        themeBtn.title = `تم دستی: ${currentTheme.name}`;
      }
    }
  }

  resetToAutoTheme() {
    this.manualTheme = null;
    this.dataManager.saveThemeSettings();
    this.applyCurrentTheme();
    this.updateThemeButton();
  }
}
