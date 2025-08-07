class SpendingTracker {
  constructor() {
    this.currentJalaliDate = window.jalaali.toJalaali(new Date());
    this.expenses = this.loadExpenses();

    this.monthNamesFa = [
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

    // Persian day names
    this.dayNamesFa = [
      "یکشنبه", // Sunday
      "دوشنبه", // Monday
      "سه‌شنبه", // Tuesday
      "چهارشنبه", // Wednesday
      "پنج‌شنبه", // Thursday
      "جمعه", // Friday
      "شنبه", // Saturday
    ];

    // Persian Cultural Themes
    this.culturalThemes = {
      nowruz: {
        name: "نوروز",
        months: [1], // Farvardin
        colors: {
          primary: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
          secondary: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          accent: "#48bb78",
          text: "#2d3748",
        },
        decorations: "🌸🌱🌿🦋",
        greeting: "نوروزتان پیروز! سال نو مبارک",
        quote: "نوروز آمد و بهار جان، خوش آمدی ای عید ایران",
        specialMessage:
          "در ایام نوروز، هزینه‌هایتان را با دقت کنترل کنید تا سال خوبی داشته باشید!",
      },
      spring: {
        name: "بهار",
        months: [1, 2, 3], // Farvardin, Ordibehesht, Khordad
        colors: {
          primary: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
          secondary: "linear-gradient(135deg, #68d391 0%, #48bb78 100%)",
          accent: "#48bb78",
          text: "#2d3748",
        },
        decorations: "",
        greeting: "مدیریت هزینه‌های ماهانه",
        quote: "",
        specialMessage: "",
      },
      summer: {
        name: "تابستان",
        months: [4, 5, 6], // Tir, Mordad, Shahrivar
        colors: {
          primary: "linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)",
          secondary: "linear-gradient(135deg, #fed7aa 0%, #f6ad55 100%)",
          accent: "#ed8936",
          text: "#744210",
        },
        decorations: "",
        greeting: "مدیریت هزینه‌های ماهانه",
        quote: "",
        specialMessage: "",
      },
      autumn: {
        name: "پاییز",
        months: [7, 8, 9], // Mehr, Aban, Azar
        colors: {
          primary: "linear-gradient(135deg, #d69e2e 0%, #b7791f 100%)",
          secondary: "linear-gradient(135deg, #faf089 0%, #d69e2e 100%)",
          accent: "#d69e2e",
          text: "#744210",
        },
        decorations: "",
        greeting: "مدیریت هزینه‌های ماهانه",
        quote: "",
        specialMessage: "",
      },
      winter: {
        name: "زمستان",
        months: [10, 11, 12], // Dey, Bahman, Esfand
        colors: {
          primary: "linear-gradient(135deg, #4299e1 0%, #2b6cb0 100%)",
          secondary: "linear-gradient(135deg, #bee3f8 0%, #4299e1 100%)",
          accent: "#4299e1",
          text: "#2a4365",
        },
        decorations: "",
        greeting: "مدیریت هزینه‌های ماهانه",
        quote: "",
        specialMessage: "",
      },
      yalda: {
        name: "شب یلدا",
        months: [9], // Azar (but specific to around 30th)
        colors: {
          primary: "linear-gradient(135deg, #e53e3e 0%, #c53030 100%)",
          secondary: "linear-gradient(135deg, #feb2b2 0%, #e53e3e 100%)",
          accent: "#e53e3e",
          text: "#742a2a",
        },
        decorations: "🍎🍇🕯️📚",
        greeting: "شب یلدایتان مبارک",
        quote: "شب یلدا، شب عشق و مهربانی، شب گردهمایی و شیرینی",
        specialMessage:
          "شب یلدا، شب خانواده است. هزینه‌های مهمانی را برنامه‌ریزی کنید!",
      },
    };

    // Theme control settings
    this.themeSettings = this.loadThemeSettings();
    this.isThemeEnabled = this.themeSettings.enabled === true; // Default to false
    this.manualTheme = this.themeSettings.manualTheme || null; // null means auto-detect

    this.formatAmount = (amount) => {
      return Number(amount.toFixed(0)).toLocaleString("fa-IR");
    };

    this.init();
  }

  init() {
    this.applyCurrentTheme();
    this.updateDisplay();
    this.bindEvents();
    this.renderCalendar();
    this.renderRecentExpenses();
  }

  // Load theme settings from localStorage
  loadThemeSettings() {
    const saved = localStorage.getItem("METthemeSettings");
    if (saved) {
      return JSON.parse(saved);
    }
    return { enabled: false, manualTheme: null }; // Default to false
  }

  // Save theme settings to localStorage
  saveThemeSettings() {
    localStorage.setItem(
      "METthemeSettings",
      JSON.stringify({
        enabled: this.isThemeEnabled,
        manualTheme: this.manualTheme,
      })
    );
  }

  // Get effective theme (manual override or auto-detected)
  getEffectiveTheme() {
    if (!this.isThemeEnabled) {
      return this.getDefaultTheme();
    }

    if (this.manualTheme) {
      return this.culturalThemes[this.manualTheme];
    }

    return this.getCurrentTheme();
  }

  // Default minimal theme
  getDefaultTheme() {
    return {
      name: "پیش‌فرض",
      colors: {
        primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        secondary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        accent: "#667eea",
        text: "#333",
      },
      decorations: "",
      greeting: "مدیریت هزینه‌های ماهانه",
      quote: "",
      specialMessage: "",
    };
  }

  // Toggle theme system on/off
  toggleThemeSystem() {
    this.isThemeEnabled = !this.isThemeEnabled;
    this.saveThemeSettings();
    this.applyCurrentTheme();
    this.updateThemeButton();
  }

  // Set manual theme
  setManualTheme(themeKey) {
    this.manualTheme = themeKey;
    this.saveThemeSettings();
    this.applyCurrentTheme();
    this.updateThemeButton();
  }

  // Reset to auto theme
  resetToAutoTheme() {
    this.manualTheme = null;
    this.saveThemeSettings();
    this.applyCurrentTheme();
    this.updateThemeButton();
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

  // Show theme selector modal
  showThemeSelector() {
    const modal = document.createElement("div");
    modal.className = "modal theme-selector-modal";
    modal.id = "themeModal";
    modal.style.display = "block";

    const currentTheme = this.getEffectiveTheme();
    const isAuto = this.isThemeEnabled && !this.manualTheme;

    modal.innerHTML = `
    <div class="modal-content theme-modal-content">
      <div class="modal-header">
        <h3>انتخاب تم و ظاهر</h3>
        <button id="closeThemeModal" class="close-btn">×</button>
      </div>
      <div class="modal-body">
        <div class="theme-control-section">
          <div class="theme-toggle-container">
            <label class="theme-toggle-label">
              <input type="checkbox" id="themeEnabledToggle" ${
                this.isThemeEnabled ? "checked" : ""
              }>
              <span class="theme-toggle-slider"></span>
              <span class="theme-toggle-text">تم‌های فرهنگی فارسی</span>
            </label>
            <p class="theme-toggle-description">
              ${
                this.isThemeEnabled
                  ? "تم‌ها بر اساس تقویم فارسی و فصول تغییر می‌کنند"
                  : "استفاده از تم ساده و یکنواخت"
              }
            </p>
          </div>
        </div>

        ${
          this.isThemeEnabled
            ? `
          <div class="theme-selection-section">
            <h4>انتخاب تم:</h4>
            <div class="theme-options">
              <div class="theme-option ${
                isAuto ? "active" : ""
              }" data-theme="auto">
                <div class="theme-preview auto-theme">
                  <span class="theme-icon">🌟</span>
                </div>
                <span class="theme-name">خودکار</span>
                <span class="theme-description">بر اساس تاریخ فارسی</span>
              </div>

              ${Object.keys(this.culturalThemes)
                .map((themeKey) => {
                  const theme = this.culturalThemes[themeKey];
                  const isActive = this.manualTheme === themeKey;
                  return `
                  <div class="theme-option ${
                    isActive ? "active" : ""
                  }" data-theme="${themeKey}">
                    <div class="theme-preview" style="background: ${
                      theme.colors.primary
                    }">
                      <span class="theme-icon">${theme.decorations.charAt(
                        0
                      )}</span>
                    </div>
                    <span class="theme-name">${theme.name}</span>
                    <span class="theme-description">${theme.greeting}</span>
                  </div>
                `;
                })
                .join("")}
            </div>
          </div>

          <div class="current-theme-info">
            <h4>تم فعلی:</h4>
            <div class="current-theme-display">
              <div class="current-theme-preview" style="background: ${
                currentTheme.colors.primary
              }">
                <span class="current-theme-icon">${
                  currentTheme.decorations.charAt(0) || "🎨"
                }</span>
              </div>
              <div class="current-theme-details">
                <span class="current-theme-name">${currentTheme.name}</span>
                <span class="current-theme-greeting">${
                  currentTheme.greeting
                }</span>
                ${
                  currentTheme.quote
                    ? `<span class="current-theme-quote">${currentTheme.quote}</span>`
                    : ""
                }
              </div>
            </div>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `;

    document.body.appendChild(modal);

    // Handle theme enabled toggle
    document
      .getElementById("themeEnabledToggle")
      .addEventListener("change", (e) => {
        this.isThemeEnabled = e.target.checked;
        this.saveThemeSettings();
        this.applyCurrentTheme();
        document.body.removeChild(modal);
        this.showThemeSelector(); // Refresh modal
      });

    // Handle theme selection
    modal.querySelectorAll(".theme-option").forEach((option) => {
      option.addEventListener("click", () => {
        const themeKey = option.dataset.theme;

        if (themeKey === "auto") {
          this.resetToAutoTheme();
        } else {
          this.setManualTheme(themeKey);
        }

        document.body.removeChild(modal);
        this.showSuccess("تم با موفقیت تغییر کرد!");
      });
    });

    // Handle close modal
    document.getElementById("closeThemeModal").addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target.id === "themeModal") {
        document.body.removeChild(modal);
      }
    });
  }

  // Get current cultural theme based on Persian date
  getCurrentTheme() {
    const currentMonth = this.currentJalaliDate.jm;
    const currentDay = this.currentJalaliDate.jd;

    // Special event: Yalda Night (around 30th of Azar)
    if (currentMonth === 9 && currentDay >= 28) {
      return this.culturalThemes.yalda;
    }

    // Special event: Nowruz (1st of Farvardin)
    if (currentMonth === 1 && currentDay <= 13) {
      return this.culturalThemes.nowruz;
    }

    // Seasonal themes
    if ([1, 2, 3].includes(currentMonth)) {
      return this.culturalThemes.spring;
    } else if ([4, 5, 6].includes(currentMonth)) {
      return this.culturalThemes.summer;
    } else if ([7, 8, 9].includes(currentMonth)) {
      return this.culturalThemes.autumn;
    } else {
      return this.culturalThemes.winter;
    }
  }

  // Apply current theme to the page
  applyCurrentTheme() {
    const theme = this.getEffectiveTheme();
    const root = document.documentElement;

    // Apply CSS custom properties
    root.style.setProperty("--theme-primary", theme.colors.primary);
    root.style.setProperty("--theme-secondary", theme.colors.secondary);
    root.style.setProperty("--theme-accent", theme.colors.accent);
    root.style.setProperty("--theme-text", theme.colors.text);

    // Update body background
    document.body.style.background = theme.colors.primary;

    // Add theme class to body
    document.body.className = `theme-${theme.name
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

    // Update cultural header only if themes are enabled
    if (
      this.isThemeEnabled &&
      (theme.decorations || theme.quote || theme.specialMessage)
    ) {
      this.updateCulturalHeader(theme);
    } else {
      this.removeCulturalHeader();
    }

    // Update theme button
    this.updateThemeButton();
  }

  // Remove cultural header
  removeCulturalHeader() {
    const existingHeader = document.querySelector(".cultural-header");
    if (existingHeader) {
      existingHeader.remove();
    }
  }

  // Update cultural header with theme-specific content
  updateCulturalHeader(theme) {
    const existingHeader = document.querySelector(".cultural-header");
    if (existingHeader) {
      existingHeader.remove();
    }

    const culturalHeader = document.createElement("div");
    culturalHeader.className = "cultural-header";
    culturalHeader.innerHTML = `
    <div class="cultural-decorations">${theme.decorations}</div>
    <div class="cultural-greeting">${theme.greeting}</div>
    <div class="cultural-quote">${theme.quote}</div>
    <div class="cultural-message">${theme.specialMessage}</div>
  `;

    const container = document.querySelector(".container");
    const header = document.querySelector(".header");
    container.insertBefore(culturalHeader, header.nextSibling);
  }

  // Show the whole expeses of the month modal
  showMonthExpensesModal() {
    const monthExpenses = this.getCurrentMonthExpenses(); // Already sorted by timestamp
    const [jy, jm] = [this.currentJalaliDate.jy, this.currentJalaliDate.jm];
    const monthName = this.monthNamesFa[jm - 1];

    document.getElementById(
      "monthModalTitle"
    ).textContent = `هزینه‌های ${monthName} ${jy}`;
    const monthExpensesListContainer =
      document.getElementById("monthExpensesList");
    monthExpensesListContainer.innerHTML = "";

    if (monthExpenses.length === 0) {
      monthExpensesListContainer.innerHTML =
        '<p style="text-align: center; color: #718096;">این ماه هنوز هزینه ای وارد نشده است.</p>';
    } else {
      // Group expenses by day
      const expensesByDay = monthExpenses.reduce((acc, expense) => {
        const dateKey = expense.persianDate;
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(expense);
        return acc;
      }, {});

      // Sort days in ascending order
      const sortedDates = Object.keys(expensesByDay).sort((a, b) => {
        const [ay, am, ad] = a.split("/").map(Number);
        const [by, bm, bd] = b.split("/").map(Number);
        if (ay !== by) return ay - by;
        if (am !== bm) return am - bm;
        return ad - bd;
      });

      sortedDates.forEach((dateKey) => {
        const dayExpenses = expensesByDay[dateKey];
        const [jy, jm, jd] = dateKey.split("/").map(Number);
        const dayName = this.getPersianDayName(jy, jm, jd);
        const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        const daySection = document.createElement("div");
        daySection.className = "day-expenses-section"; // A new class for styling if needed
        daySection.innerHTML = `
        <h4 style="margin-top: 15px; margin-bottom: 10px; color: var(--theme-accent); font-weight: 600;">
          ${dayName}، ${jd} ${this.monthNamesFa[jm - 1]}
          <span style="float: left; color: var(--theme-text);">${this.formatAmount(
            dayTotal
          )} ت</span>
        </h4>
        <div class="expenses-for-day"></div>
      `;
        const expensesForDayDiv = daySection.querySelector(".expenses-for-day");

        dayExpenses.forEach((expense) => {
          const expenseElement = document.createElement("div");
          expenseElement.className = "expense-item";
          expenseElement.innerHTML = `
          <div class="expense-details">
            <span class="expense-description">${expense.description}</span>
            <span class="expense-date">${new Date(
              expense.timestamp
            ).toLocaleTimeString()}</span>
          </div>
          <span class="expense-amount">${this.formatAmount(
            expense.amount
          )} تومان</span>
        `;
          expensesForDayDiv.appendChild(expenseElement);
        });
        monthExpensesListContainer.appendChild(daySection);
      });
    }

    const monthTotal = this.getCurrentMonthTotal();
    document.getElementById("monthTotal").textContent = `${this.formatAmount(
      monthTotal
    )} تومان`;

    document.getElementById("monthExpensesModal").style.display = "block";
  }

  // Close the month expenses modal
  closeMonthExpensesModal() {
    document.getElementById("monthExpensesModal").style.display = "none";
  }

  bindEvents() {
    document
      .getElementById("addExpense")
      .addEventListener("click", () => this.addExpense());
    document
      .getElementById("expenseAmount")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.addExpense();
      });
    document
      .getElementById("expenseDescription")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.addExpense();
      });
    document
      .getElementById("prevMonth")
      .addEventListener("click", () => this.changeMonth(-1));
    document
      .getElementById("nextMonth")
      .addEventListener("click", () => this.changeMonth(1));
    document
      .getElementById("closeModal")
      .addEventListener("click", () => this.closeModal());
    document
      .getElementById("closeMonthExpensesModal")
      .addEventListener("click", () => this.closeMonthExpensesModal());
    document
      .getElementById("viewMonthExpenses")
      .addEventListener("click", () => this.showMonthExpensesModal());

    const amountInput = document.getElementById("expenseAmount");
    amountInput.addEventListener("input", (e) => {
      // Remove everything that's not a digit
      const onlyNumbers = e.target.value.replace(/\D/g, "");

      // Format with commas (e.g., 11000 -> 11,000)
      e.target.value = onlyNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    });

    // Close modal when clicking outside
    document.getElementById("dayModal").addEventListener("click", (e) => {
      if (e.target.id === "dayModal") this.closeModal();
    });

    // Close monthly expenses modal when clicking outside
    document
      .getElementById("monthExpensesModal")
      .addEventListener("click", (e) => {
        if (e.target.id === "monthExpensesModal")
          this.closeMonthExpensesModal();
      });

    document
      .getElementById("themeToggle")
      .addEventListener("click", () => this.showThemeSelector());
  }

  // Get Persian day name for a given Jalali date
  getPersianDayName(jYear, jMonth, jDay) {
    // Convert Jalali to Gregorian to get the day of week
    const gDate = window.jalaali.toGregorian(jYear, jMonth, jDay);
    const gregorianDate = new Date(gDate.gy, gDate.gm - 1, gDate.gd);
    const dayOfWeek = gregorianDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    return this.dayNamesFa[dayOfWeek];
  }

  // Convert Gregorian date string to Persian date string
  gregorianToPersianDateKey(gregorianDateStr) {
    const gDate = new Date(gregorianDateStr);
    const jDate = window.jalaali.toJalaali(gDate);
    return `${jDate.jy}/${jDate.jm}/${jDate.jd}`;
  }

  // Convert Persian date string to Gregorian date string
  persianToGregorianDateKey(persianDateStr) {
    const [jy, jm, jd] = persianDateStr.split("/").map(Number);
    const gDate = window.jalaali.toGregorian(jy, jm, jd);
    return `${gDate.gy}-${String(gDate.gm).padStart(2, "0")}-${String(
      gDate.gd
    ).padStart(2, "0")}`;
  }

  // Get today's Persian date key
  getTodayPersianKey() {
    const today = window.jalaali.toJalaali(new Date());
    return `${today.jy}/${today.jm}/${today.jd}`;
  }

  // Migration function to convert old data format to new format
  migrateExpensesToPersianDates() {
    const oldExpenses = localStorage.getItem("monthlyExpenses");
    if (!oldExpenses) return {};

    const oldData = JSON.parse(oldExpenses);
    const newData = {};

    // Convert each date key from Gregorian to Persian
    Object.keys(oldData).forEach((gregorianDateKey) => {
      const persianDateKey = this.gregorianToPersianDateKey(gregorianDateKey);
      newData[persianDateKey] = oldData[gregorianDateKey];
    });

    // Save the migrated data
    localStorage.setItem("monthlyExpenses2", JSON.stringify(newData));
    console.log(
      "Successfully migrated expenses from Gregorian to Persian calendar format"
    );
    return newData;
  }

  addExpense() {
    const amount = Number.parseFloat(
      document.getElementById("expenseAmount").value.replace(/,/g, "")
    );
    const description = document
      .getElementById("expenseDescription")
      .value.trim();

    if (!amount || amount <= 0) {
      this.showError("لطفا مبلغ معتبری وارد کنید");
      return;
    }

    if (!description) {
      this.showError("لطفا توضیحات را وارد کنید");
      return;
    }

    const todayPersianKey = this.getTodayPersianKey();
    const expense = {
      id: Date.now(),
      persianDate: todayPersianKey,
      amount: amount,
      description: description,
      timestamp: new Date().toISOString(),
    };

    if (!this.expenses[todayPersianKey]) {
      this.expenses[todayPersianKey] = [];
    }

    this.expenses[todayPersianKey].push(expense);
    this.saveExpenses();

    // Clear inputs
    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseDescription").value = "";

    // Add success animation
    const addBtn = document.getElementById("addExpense");
    addBtn.classList.add("pulse");
    setTimeout(() => addBtn.classList.remove("pulse"), 600);

    this.updateDisplay();
    this.renderCalendar();
    this.renderRecentExpenses();
  }

  showError(message) {
    alert(message);
  }

  // Show themed success message
  showSuccess(message) {
    const theme = this.getEffectiveTheme();
    const notification = document.createElement("div");
    notification.className = "success-notification themed-notification";
    notification.textContent = message;
    notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${theme.colors.secondary};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
    z-index: 10000;
    font-weight: 600;
    animation: slideInRight 0.3s ease-out;
  `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease-out";
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  changeMonth(direction) {
    // Navigate Persian calendar months
    let newMonth = this.currentJalaliDate.jm + direction;
    let newYear = this.currentJalaliDate.jy;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    this.currentJalaliDate = { jy: newYear, jm: newMonth, jd: 1 };

    // Reapply theme when month changes
    this.applyCurrentTheme();

    this.updateDisplay();
    this.renderCalendar();
    this.renderRecentExpenses();
  }

  updateDisplay() {
    const currentMonthStr = `${
      this.monthNamesFa[this.currentJalaliDate.jm - 1]
    } ${this.currentJalaliDate.jy}`;
    document.getElementById("currentMonth").textContent = currentMonthStr;

    // Get totals for ONLY the currently displayed month
    const monthlyTotal = this.getCurrentMonthTotal();
    const dailyAverage = this.getCurrentMonthDailyAverage();

    document.getElementById("totalSpent").textContent = `${this.formatAmount(
      monthlyTotal
    )} تومان`;
    document.getElementById("dailyAverage").textContent = `${this.formatAmount(
      dailyAverage
    )} تومان`;

    // Show/hide add expense card based on current month
    const today = window.jalaali.toJalaali(new Date());
    const isCurrentMonth =
      today.jy === this.currentJalaliDate.jy &&
      today.jm === this.currentJalaliDate.jm;

    const addExpenseCard = document.querySelector(".add-expense-card");
    if (addExpenseCard) {
      if (isCurrentMonth) {
        addExpenseCard.style.display = "block";
      } else {
        addExpenseCard.style.display = "none";
      }
    }
  }

  // Get total for currently displayed Persian month
  getCurrentMonthTotal() {
    const currentYear = this.currentJalaliDate.jy;
    const currentMonth = this.currentJalaliDate.jm;
    let total = 0;

    Object.keys(this.expenses).forEach((persianDateKey) => {
      const [year, month] = persianDateKey.split("/").map(Number);
      if (year === currentYear && month === currentMonth) {
        this.expenses[persianDateKey].forEach((expense) => {
          total += expense.amount;
        });
      }
    });

    return total;
  }

  // Calculate daily average for current displayed Persian month
  getCurrentMonthDailyAverage() {
    const monthlyTotal = this.getCurrentMonthTotal();
    const today = window.jalaali.toJalaali(new Date());
    const isCurrentMonth =
      today.jy === this.currentJalaliDate.jy &&
      today.jm === this.currentJalaliDate.jm;

    // Get days in Persian month
    const daysInMonth =
      this.currentJalaliDate.jm <= 6
        ? 31
        : this.currentJalaliDate.jm <= 11
        ? 30
        : window.jalaali.isLeapJalaaliYear(this.currentJalaliDate.jy)
        ? 30
        : 29;

    // For current month, use days passed. For other months, use full month days
    const daysPassed = isCurrentMonth ? today.jd : daysInMonth;
    return daysPassed > 0 ? monthlyTotal / daysPassed : 0;
  }

  renderCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const jYear = this.currentJalaliDate.jy;
    const jMonth = this.currentJalaliDate.jm;

    const gStartDate = window.jalaali.toGregorian(jYear, jMonth, 1);
    const firstDay = new Date(
      gStartDate.gy,
      gStartDate.gm - 1,
      gStartDate.gd
    ).getDay();

    const today = window.jalaali.toJalaali(new Date());
    const daysInMonth =
      jMonth <= 6
        ? 31
        : jMonth <= 11
        ? 30
        : window.jalaali.isLeapJalaaliYear(jYear)
        ? 30
        : 29;

    // Add empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement("div");
      calendar.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const persianDateKey = `${jYear}/${jMonth}/${day}`;
      const dayExpenses = this.expenses[persianDateKey] || [];
      const dayTotal = dayExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      // Get the Persian day name for this date
      const dayName = this.getPersianDayName(jYear, jMonth, day);

      const dayElement = document.createElement("div");
      dayElement.className = "calendar-day";

      if (today.jy === jYear && today.jm === jMonth && today.jd === day) {
        dayElement.classList.add("today");
      }

      if (dayTotal > 0) {
        dayElement.classList.add("has-expense");
      }

      // Add special day highlighting
      if (this.isSpecialDay(jYear, jMonth, day)) {
        dayElement.classList.add("special-day");
      }

      dayElement.innerHTML = `
      <span class="day-number">${day}</span>
      <span class="day-name">${dayName}</span>
      ${
        dayTotal > 0
          ? `<span class="day-amount">${this.formatAmount(dayTotal)} ت</span>`
          : ""
      }
      ${this.getSpecialDayIcon(jYear, jMonth, day)}
    `;

      dayElement.addEventListener("click", () =>
        this.showDayModal(persianDateKey)
      );
      calendar.appendChild(dayElement);
    }
  }

  // Check if a day is special (cultural events)
  isSpecialDay(jYear, jMonth, jDay) {
    // Nowruz period (1-13 Farvardin)
    if (jMonth === 1 && jDay <= 13) return true;

    // Yalda Night (around 30 Azar)
    if (jMonth === 9 && jDay >= 28) return true;

    // Chaharshanbe Suri (last Wednesday before Nowruz)
    // This would need more complex calculation

    return false;
  }

  // Get special day icon
  getSpecialDayIcon(jYear, jMonth, jDay) {
    if (jMonth === 1 && jDay === 1)
      return '<span class="special-icon">🎊</span>'; // Nowruz
    if (jMonth === 1 && jDay === 13)
      return '<span class="special-icon">🌿</span>'; // Sizdah Bedar
    if (jMonth === 9 && jDay === 30)
      return '<span class="special-icon">🕯️</span>'; // Yalda
    return "";
  }

  showDayModal(persianDateKey) {
    const dayExpenses = this.expenses[persianDateKey] || [];
    const [jy, jm, jd] = persianDateKey.split("/").map(Number);

    // Get day name for modal title
    const dayName = this.getPersianDayName(jy, jm, jd);
    document.getElementById("modalDate").textContent = `${dayName}، ${jd} ${
      this.monthNamesFa[jm - 1]
    } ${jy}`;

    const dayExpensesContainer = document.getElementById("dayExpenses");
    dayExpensesContainer.innerHTML = "";

    if (dayExpenses.length === 0) {
      dayExpensesContainer.innerHTML =
        '<p style="text-align: center; color: #718096;">هزینه ای وارد نشده است</p>';
    } else {
      dayExpenses.forEach((expense) => {
        const expenseElement = document.createElement("div");
        expenseElement.className = "expense-item modal-expense-item";
        expenseElement.innerHTML = `
        <div class="expense-details">
          <span class="expense-description">${expense.description}</span>
          <span class="expense-date">${new Date(
            expense.timestamp
          ).toLocaleTimeString()}</span>
        </div>
        <div class="expense-actions">
          <span class="expense-amount">${this.formatAmount(
            expense.amount
          )} تومان</span>
          <div class="action-buttons">
            <button type="button" class="edit-expense-btn" data-expense-id="${
              expense.id
            }" title="ویرایش">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button type="button" class="remove-expense-btn" data-expense-id="${
              expense.id
            }" title="حذف">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>
      `;
        dayExpensesContainer.appendChild(expenseElement);
      });

      // Bind events for the edit/remove buttons
      this.bindModalEvents(persianDateKey);
    }

    // Add past day expense button
    const today = window.jalaali.toJalaali(new Date());
    const [currentJy, currentJm, currentJd] = [today.jy, today.jm, today.jd];
    const [dayJy, dayJm, dayJd] = [jy, jm, jd];

    // Check if the selected day is before today
    const isPastDay =
      dayJy < currentJy ||
      (dayJy === currentJy && dayJm < currentJm) ||
      (dayJy === currentJy && dayJm === currentJm && dayJd < currentJd);

    if (isPastDay) {
      const addExpenseButton = document.createElement("div");
      addExpenseButton.className = "add-expense-to-day";
      addExpenseButton.innerHTML = `
      <button id="addExpenseToDay" class="add-expense-day-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        افزودن هزینه به این روز
      </button>
    `;
      dayExpensesContainer.appendChild(addExpenseButton);

      // Bind event for add expense button
      document
        .getElementById("addExpenseToDay")
        .addEventListener("click", () => {
          this.showAddExpenseForm(persianDateKey);
        });
    }

    const dayTotal = dayExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    document.getElementById("dayTotal").textContent = `${this.formatAmount(
      dayTotal
    )} تومان`;

    document.getElementById("dayModal").style.display = "block";
  }

  // Edit expense functionality
  editExpense(persianDateKey, expenseId) {
    const dayExpenses = this.expenses[persianDateKey] || [];
    const expense = dayExpenses.find((exp) => exp.id === expenseId);

    if (!expense) return;

    // Create edit form in modal
    const editForm = document.createElement("div");
    editForm.className = "edit-expense-form";
    editForm.innerHTML = `
    <div class="edit-form-header">
      <h4>ویرایش هزینه</h4>
    </div>
    <div class="edit-form-body">
      <input type="text" id="editAmount" value="${expense.amount}" placeholder="مبلغ">
      <input type="text" id="editDescription" value="${expense.description}" placeholder="توضیحات">
      <div class="edit-form-buttons">
        <button id="saveEdit" class="save-btn">ذخیره</button>
        <button id="cancelEdit" class="cancel-btn">لغو</button>
      </div>
    </div>
  `;

    // Replace the modal content temporarily
    const modalBody = document.getElementById("dayExpenses");
    const originalContent = modalBody.innerHTML;
    modalBody.innerHTML = "";
    modalBody.appendChild(editForm);

    // Handle amount input formatting
    const amountInput = document.getElementById("editAmount");
    amountInput.addEventListener("input", (e) => {
      const onlyNumbers = e.target.value.replace(/\D/g, "");
      e.target.value = onlyNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    });

    // Handle save
    document.getElementById("saveEdit").addEventListener("click", () => {
      const newAmount = Number.parseFloat(amountInput.value.replace(/,/g, ""));
      const newDescription = document
        .getElementById("editDescription")
        .value.trim();

      if (!newAmount || newAmount <= 0) {
        this.showError("لطفا مبلغ معتبری وارد کنید");
        return;
      }

      if (!newDescription) {
        this.showError("لطفا توضیحات را وارد کنید");
        return;
      }

      // Update the expense
      expense.amount = newAmount;
      expense.description = newDescription;
      expense.lastModified = new Date().toISOString();

      this.saveExpenses();
      this.updateDisplay();
      this.renderCalendar();
      this.renderRecentExpenses();

      // Refresh the modal content
      this.showDayModal(persianDateKey);
    });

    // Handle cancel
    document.getElementById("cancelEdit").addEventListener("click", () => {
      modalBody.innerHTML = originalContent;
      this.bindModalEvents(persianDateKey);
    });
  }

  // Remove expense functionality
  removeExpense(persianDateKey, expenseId) {
    if (!confirm("آیا از حذف این هزینه اطمینان دارید؟")) {
      return;
    }

    const dayExpenses = this.expenses[persianDateKey] || [];
    const expenseIndex = dayExpenses.findIndex((exp) => exp.id === expenseId);

    if (expenseIndex === -1) return;

    // Remove the expense
    dayExpenses.splice(expenseIndex, 1);

    // If no expenses left for this day, remove the day entry
    if (dayExpenses.length === 0) {
      delete this.expenses[persianDateKey];
    }

    this.saveExpenses();
    this.updateDisplay();
    this.renderCalendar();
    this.renderRecentExpenses();

    // Refresh the modal content
    this.showDayModal(persianDateKey);
  }

  // Show add expense form for specific day
  showAddExpenseForm(persianDateKey) {
    const [jy, jm, jd] = persianDateKey.split("/").map(Number);

    // Create add expense form
    const addForm = document.createElement("div");
    addForm.className = "add-expense-form";
    addForm.innerHTML = `
    <div class="add-form-header">
      <h4>افزودن هزینه به ${jd} ${this.monthNamesFa[jm - 1]} ${jy}</h4>
    </div>
    <div class="add-form-body">
      <input type="text" id="addDayAmount" placeholder="مبلغ" value="">
      <input type="text" id="addDayDescription" placeholder="توضیحات" value="">
      <div class="add-form-buttons">
        <button id="saveAddDay" class="save-btn">افزودن</button>
        <button id="cancelAddDay" class="cancel-btn">لغو</button>
      </div>
    </div>
  `;

    // Replace the modal content temporarily
    const modalBody = document.getElementById("dayExpenses");
    const originalContent = modalBody.innerHTML;
    modalBody.innerHTML = "";
    modalBody.appendChild(addForm);

    // Handle amount input formatting
    const amountInput = document.getElementById("addDayAmount");
    amountInput.addEventListener("input", (e) => {
      const onlyNumbers = e.target.value.replace(/\D/g, "");
      e.target.value = onlyNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    });

    // Focus on amount input
    amountInput.focus();

    // Handle Enter key on inputs
    amountInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        document.getElementById("addDayDescription").focus();
      }
    });

    document
      .getElementById("addDayDescription")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          document.getElementById("saveAddDay").click();
        }
      });

    // Handle save
    document.getElementById("saveAddDay").addEventListener("click", () => {
      const amount = Number.parseFloat(amountInput.value.replace(/,/g, ""));
      const description = document
        .getElementById("addDayDescription")
        .value.trim();

      if (!amount || amount <= 0) {
        this.showError("لطفا مبلغ معتبری وارد کنید");
        return;
      }

      if (!description) {
        this.showError("لطفا توضیحات را وارد کنید");
        return;
      }

      // Create new expense for the specific day
      const expense = {
        id: Date.now(),
        persianDate: persianDateKey,
        amount: amount,
        description: description,
        timestamp: new Date().toISOString(),
      };

      // Add to expenses
      if (!this.expenses[persianDateKey]) {
        this.expenses[persianDateKey] = [];
      }

      this.expenses[persianDateKey].push(expense);
      this.saveExpenses();

      // Update all displays
      this.updateDisplay();
      this.renderCalendar();
      this.renderRecentExpenses();

      // Show success message
      this.showSuccess("هزینه با موفقیت اضافه شد!");

      // Refresh the modal content
      this.showDayModal(persianDateKey);
    });

    // Handle cancel
    document.getElementById("cancelAddDay").addEventListener("click", () => {
      modalBody.innerHTML = originalContent;
      this.bindModalEvents(persianDateKey);
    });
  }

  bindModalEvents(persianDateKey) {
    const editButtons = document.querySelectorAll(".edit-expense-btn");
    const removeButtons = document.querySelectorAll(".remove-expense-btn");

    editButtons.forEach((btn) => {
      // Remove any existing listeners
      btn.replaceWith(btn.cloneNode(true));
      const newBtn = document.querySelector(
        `[data-expense-id="${btn.dataset.expenseId}"].edit-expense-btn`
      );

      const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const expenseId = Number.parseInt(e.currentTarget.dataset.expenseId);
        this.editExpense(persianDateKey, expenseId);
      };

      // Add both click and touchend events for iOS compatibility
      newBtn.addEventListener("click", handleEdit, { passive: false });
      newBtn.addEventListener("touchend", handleEdit, { passive: false });
    });

    removeButtons.forEach((btn) => {
      // Remove any existing listeners
      btn.replaceWith(btn.cloneNode(true));
      const newBtn = document.querySelector(
        `[data-expense-id="${btn.dataset.expenseId}"].remove-expense-btn`
      );

      const handleRemove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const expenseId = Number.parseInt(e.currentTarget.dataset.expenseId);
        this.removeExpense(persianDateKey, expenseId);
      };

      // Add both click and touchend events for iOS compatibility
      newBtn.addEventListener("click", handleRemove, { passive: false });
      newBtn.addEventListener("touchend", handleRemove, { passive: false });
    });
  }

  closeModal() {
    document.getElementById("dayModal").style.display = "none";
  }

  renderRecentExpenses() {
    const expensesContainer = document.getElementById("expensesList");
    expensesContainer.innerHTML = "";

    // Get expenses for current displayed month only
    const currentMonthExpenses = this.getCurrentMonthExpenses();

    if (currentMonthExpenses.length === 0) {
      expensesContainer.innerHTML =
        '<p style="text-align: center; color: #718096;">این ماه هنوز هزینه ای وارد نشده است.</p>';
      return;
    }

    // Show recent expenses for current month (up to 10)
    const recentExpenses = currentMonthExpenses.slice(0, 10);

    recentExpenses.forEach((expense) => {
      const expenseElement = document.createElement("div");
      expenseElement.className = "expense-item";

      const [jy, jm, jd] = expense.persianDate.split("/").map(Number);

      expenseElement.innerHTML = `
      <div class="expense-details">
        <span class="expense-description">${expense.description}</span>
        <span class="expense-date">${jd} ${this.monthNamesFa[jm - 1]}</span>
      </div>
      <span class="expense-amount">${this.formatAmount(
        expense.amount
      )} تومان</span>
    `;

      expensesContainer.appendChild(expenseElement);
    });
  }

  // Get expenses for currently displayed Persian month
  getCurrentMonthExpenses() {
    const currentYear = this.currentJalaliDate.jy;
    const currentMonth = this.currentJalaliDate.jm;
    const monthExpenses = [];

    Object.keys(this.expenses).forEach((persianDateKey) => {
      const [year, month] = persianDateKey.split("/").map(Number);
      if (year === currentYear && month === currentMonth) {
        this.expenses[persianDateKey].forEach((expense) => {
          monthExpenses.push({ ...expense, persianDate: persianDateKey });
        });
      }
    });

    // Sort by timestamp (most recent first)
    monthExpenses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return monthExpenses;
  }

  loadExpenses() {
    // First check if the new format exists
    const newFormatData = localStorage.getItem("monthlyExpenses2");
    if (newFormatData) {
      return JSON.parse(newFormatData);
    }

    // If new format doesn't exist, check for old format and migrate
    const oldFormatData = localStorage.getItem("monthlyExpenses");
    if (oldFormatData) {
      console.log(
        "Found old format data, migrating to Persian calendar format..."
      );
      return this.migrateExpensesToPersianDates();
    }

    // If neither exists, return empty object
    return {};
  }

  saveExpenses() {
    localStorage.setItem("monthlyExpenses2", JSON.stringify(this.expenses));
  }
}

// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new SpendingTracker();
});
