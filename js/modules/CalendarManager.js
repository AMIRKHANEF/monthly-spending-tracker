import { dayNamesFa, formatAmount, monthNamesFa } from "../utils.js";

export class CalendarManager {
  constructor(currentDate, expenseManager) {
    this.currentJalaliDate = currentDate;
    this.expenseManager = expenseManager;
  }

  updateDate(newDate) {
    this.currentJalaliDate = newDate;
  }

  renderCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const jYear = this.currentJalaliDate.jy;
    const jMonth = this.currentJalaliDate.jm;

    const today = window.jalaali.toJalaali(new Date());
    const daysInMonth =
      jMonth <= 6
        ? 31
        : jMonth <= 11
        ? 30
        : window.jalaali.isLeapJalaaliYear(jYear)
        ? 30
        : 29;

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = this.createDayElement(day, jYear, jMonth, today);
      calendar.appendChild(dayElement);
    }
  }

  createDayElement(day, jYear, jMonth, today) {
    const dayElement = document.createElement("div");
    dayElement.className = "calendar-day";

    const persianDateKey = `${jYear}/${jMonth}/${day}`;
    const dayExpenses = this.expenseManager.getDayExpenses(persianDateKey);
    const dayTotal = dayExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Check if this is today
    if (today.jy === jYear && today.jm === jMonth && today.jd === day) {
      dayElement.classList.add("today");
    }

    // Check if day has expenses
    if (dayTotal > 0) {
      dayElement.classList.add("has-expense");
    }

    // Get day name in Persian
    const gDate = window.jalaali.toGregorian(jYear, jMonth, day);
    const dayOfWeek = new Date(gDate.gy, gDate.gm - 1, gDate.gd).getDay();
    const dayName = dayNamesFa[dayOfWeek];

    dayElement.innerHTML = `
      <div class="day-name">${dayName}</div>
      <div class="day-number">${day}</div>
      ${
        dayTotal > 0
          ? `<div class="day-amount">${formatAmount(dayTotal)}</div>`
          : ""
      }
    `;

    dayElement.addEventListener("click", () => {
      this.showDayModal(persianDateKey, day, jMonth, jYear);
    });

    return dayElement;
  }

  showDayModal(persianDate, day, month, year) {
    const modal = document.getElementById("dayModal");
    const modalDate = document.getElementById("modalDate");
    const dayExpenses = document.getElementById("dayExpenses");
    const dayTotal = document.getElementById("dayTotal");

    modalDate.textContent = `${day} ${monthNamesFa[month - 1]} ${year}`;

    const expenses = this.expenseManager.getDayExpenses(persianDate);
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    dayExpenses.innerHTML = "";
    expenses.forEach((expense) => {
      const expenseElement = document.createElement("div");
      expenseElement.className = "expense-item modal-expense-item";
      expenseElement.innerHTML = `
        <div class="expense-details">
          <span class="expense-description">${expense.description}</span>
        </div>
        <div class="expense-actions">
          <span class="expense-amount">${formatAmount(
            expense.amount
          )} تومان</span>
          <div class="action-buttons">
            <button class="remove-expense-btn" data-date="${persianDate}" data-id="${
        expense.id
      }">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
      dayExpenses.appendChild(expenseElement);
    });

    dayTotal.textContent = `${formatAmount(total)} تومان`;
    modal.style.display = "block";
  }
}
