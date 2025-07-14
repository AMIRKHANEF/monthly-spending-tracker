class SpendingTracker {
  constructor() {
    this.currentDate = new Date();
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

    this.init();
  }

  init() {
    this.updateDisplay();
    this.bindEvents();
    this.renderCalendar();
    this.renderRecentExpenses();
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

    // Close modal when clicking outside
    document.getElementById("dayModal").addEventListener("click", (e) => {
      if (e.target.id === "dayModal") this.closeModal();
    });
  }

  addExpense() {
    const amount = Number.parseFloat(
      document.getElementById("expenseAmount").value
    );
    const description = document
      .getElementById("expenseDescription")
      .value.trim();

    if (!amount || amount <= 0) {
      this.showError("Please enter a valid amount");
      return;
    }

    if (!description) {
      this.showError("Please enter a description");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const expense = {
      id: Date.now(),
      date: today,
      amount: amount,
      description: description,
      timestamp: new Date().toISOString(),
    };

    if (!this.expenses[today]) {
      this.expenses[today] = [];
    }

    this.expenses[today].push(expense);
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
    // Simple error handling - you could enhance this with a toast notification
    alert(message);
  }

  changeMonth(direction) {
    this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    this.updateDisplay();
    this.renderCalendar();
  }

  updateDisplay() {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const jDate = window.jalaali.toJalaali(this.currentDate);
    const currentMonthStr = `${this.monthNamesFa[jDate.jm - 1]} ${jDate.jy}`;
    document.getElementById("currentMonth").textContent = currentMonthStr;
    document.getElementById("currentMonth").textContent = currentMonthStr;

    const monthlyTotal = this.getMonthlyTotal();
    const dailyAverage = this.getDailyAverage();

    document.getElementById("totalSpent").textContent = `${monthlyTotal.toFixed(
      0
    )} تومان`;
    document.getElementById(
      "dailyAverage"
    ).textContent = `${dailyAverage.toFixed(0)} تومان`;
  }

  getMonthlyTotal() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    let total = 0;

    Object.keys(this.expenses).forEach((date) => {
      const expenseDate = new Date(date);
      if (
        expenseDate.getFullYear() === year &&
        expenseDate.getMonth() === month
      ) {
        this.expenses[date].forEach((expense) => {
          total += expense.amount;
        });
      }
    });

    return total;
  }

  getDailyAverage() {
    const monthlyTotal = this.getMonthlyTotal();
    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === this.currentDate.getFullYear() &&
      today.getMonth() === this.currentDate.getMonth();

    const daysInMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      0
    ).getDate();
    const daysPassed = isCurrentMonth ? today.getDate() : daysInMonth;

    return daysPassed > 0 ? monthlyTotal / daysPassed : 0;
  }

  renderCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const jDate = window.jalaali.toJalaali(this.currentDate);
    const jYear = jDate.jy;
    const jMonth = jDate.jm;

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
      const gDate = window.jalaali.toGregorian(jYear, jMonth, day);
      const dateStr = `${gDate.gy}-${String(gDate.gm).padStart(
        2,
        "0"
      )}-${String(gDate.gd).padStart(2, "0")}`;
      const dayExpenses = this.expenses[dateStr] || [];
      const dayTotal = dayExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      const dayElement = document.createElement("div");
      dayElement.className = "calendar-day";

      if (today.jy === jYear && today.jm === jMonth && today.jd === day) {
        dayElement.classList.add("today");
      }

      if (dayTotal > 0) {
        dayElement.classList.add("has-expense");
      }

      dayElement.innerHTML = `
      <span class="day-number">${day}</span>
      ${
        dayTotal > 0
          ? `<span class="day-amount">${dayTotal.toFixed(0)} ت</span>`
          : ""
      }
    `;

      dayElement.addEventListener("click", () =>
        this.showDayModal(dateStr, day)
      );
      calendar.appendChild(dayElement);
    }
  }

  showDayModal(dateStr, day) {
    const dayExpenses = this.expenses[dateStr] || [];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const jDate = window.jalaali.toJalaali(new Date(dateStr));
    document.getElementById("modalDate").textContent = `${
      this.monthNamesFa[jDate.jm - 1]
    } ${jDate.jd}، ${jDate.jy}`;

    const dayExpensesContainer = document.getElementById("dayExpenses");
    dayExpensesContainer.innerHTML = "";

    if (dayExpenses.length === 0) {
      dayExpensesContainer.innerHTML =
        '<p style="text-align: center; color: #718096;">No expenses for this day</p>';
    } else {
      dayExpenses.forEach((expense) => {
        const expenseElement = document.createElement("div");
        expenseElement.className = "expense-item";
        expenseElement.innerHTML = `
                    <div class="expense-details">
                        <span class="expense-description">${
                          expense.description
                        }</span>
                        <span class="expense-date">${new Date(
                          expense.timestamp
                        ).toLocaleTimeString()}</span>
                    </div>
                    <span class="expense-amount">${expense.amount.toFixed(
                      0
                    )} تومان</span>
                `;
        dayExpensesContainer.appendChild(expenseElement);
      });
    }

    const dayTotal = dayExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    document.getElementById("dayTotal").textContent = `${dayTotal.toFixed(
      0
    )} تومان`;

    document.getElementById("dayModal").style.display = "block";
  }

  closeModal() {
    document.getElementById("dayModal").style.display = "none";
  }

  renderRecentExpenses() {
    const expensesContainer = document.getElementById("expensesList");
    expensesContainer.innerHTML = "";

    // Get all expenses and sort by timestamp (most recent first)
    const allExpenses = [];
    Object.keys(this.expenses).forEach((date) => {
      this.expenses[date].forEach((expense) => {
        allExpenses.push({ ...expense, date });
      });
    });

    allExpenses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Show only the 10 most recent expenses
    const recentExpenses = allExpenses.slice(0, 10);

    if (recentExpenses.length === 0) {
      expensesContainer.innerHTML =
        '<p style="text-align: center; color: #718096;">No expenses yet. Add your first expense above!</p>';
      return;
    }

    recentExpenses.forEach((expense) => {
      const expenseElement = document.createElement("div");
      expenseElement.className = "expense-item";

      const expenseDate = new Date(expense.date);
      const formattedDate = expenseDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      expenseElement.innerHTML = `
                <div class="expense-details">
                    <span class="expense-description">${
                      expense.description
                    }</span>
                    <span class="expense-date">${formattedDate}</span>
                </div>
                <span class="expense-amount">${expense.amount.toFixed(
                  0
                )} تومان</span>
            `;

      expensesContainer.appendChild(expenseElement);
    });
  }

  loadExpenses() {
    const stored = localStorage.getItem("monthlyExpenses");
    return stored ? JSON.parse(stored) : {};
  }

  saveExpenses() {
    localStorage.setItem("monthlyExpenses", JSON.stringify(this.expenses));
  }
}

// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new SpendingTracker();
});
