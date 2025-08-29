import { formatAmount, getPersianDayName, monthNamesFa } from "../../utils.js";

export default function showMonthExpensesModal(tracker) {
  const toggleExpenseSelection = (expenseElement) => {
    const amount = Number.parseFloat(
      expenseElement.getAttribute("data-amount")
    );

    if (expenseElement.classList.contains("selected-expense")) {
      // Deselect
      expenseElement.classList.remove("selected-expense");
      tracker.selectedExpensesTotal -= amount;
    } else {
      // Select
      expenseElement.classList.add("selected-expense");
      tracker.selectedExpensesTotal += amount;
    }
    tracker.updateSelectedTotalDisplay();
  };

  const monthExpenses = tracker.expenseManager.getCurrentMonthExpenses(
    tracker.currentJalaliDate
  ); // Already sorted by timestamp
  const currentJalaliDate = tracker.calendarManager.currentJalaliDate;

  const [jy, jm] = [currentJalaliDate.jy, currentJalaliDate.jm];
  const monthName = monthNamesFa[jm - 1];

  document.getElementById(
    "monthModalTitle"
  ).textContent = `هزینه‌های ${monthName} ${jy}`;

  const monthExpensesListContainer =
    document.getElementById("monthExpensesList");

  monthExpensesListContainer.innerHTML = "";

  // Reset selected expenses total when opening the modal
  tracker.selectedExpensesTotal = 0;
  tracker.updateSelectedTotalDisplay();

  if (monthExpenses.length === 0) {
    monthExpensesListContainer.innerHTML = `<p style="text-align: center; color: #718096;">
    این ماه هنوز هزینه ای وارد نشده است.
    </p>`;
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
      const dayName = getPersianDayName(jy, jm, jd);
      const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      const daySection = document.createElement("div");

      daySection.innerHTML = `
          <h4 style="margin-top: 15px; margin-bottom: 10px; color: var(--theme-accent); font-weight: 600;">
            ${dayName}، ${jd} ${monthNamesFa[jm - 1]}
            <span style="float: left; color: var(--theme-text);">${formatAmount(
              dayTotal
            )} ت</span>
          </h4>
          <div class="expenses-for-day"></div>
        `;

      const expensesForDayDiv = daySection.querySelector(".expenses-for-day");

      dayExpenses.forEach((expense) => {
        const expenseElement = document.createElement("div");

        expenseElement.className = "expense-item";
        expenseElement.setAttribute("data-amount", expense.amount); // Store amount
        expenseElement.setAttribute("data-expense-id", expense.id); // Store ID for uniqueness
        expenseElement.innerHTML = `
            <div class="expense-details">
              <span class="expense-description">${expense.description}</span>
              <span class="expense-date">${new Date(
                expense.timestamp
              ).toLocaleTimeString()}</span>
            </div>
            <span class="expense-amount">${formatAmount(
              expense.amount
            )} تومان</span>
          `;
        expenseElement.addEventListener("click", (e) =>
          toggleExpenseSelection(e.currentTarget)
        );
        expensesForDayDiv.appendChild(expenseElement);
      });
      monthExpensesListContainer.appendChild(daySection);
    });
  }

  const monthTotal = tracker.getCurrentMonthTotal();

  document.getElementById("monthTotal").textContent = `${formatAmount(
    monthTotal
  )} تومان`;

  document.getElementById("monthExpensesModal").style.display = "block";
}
