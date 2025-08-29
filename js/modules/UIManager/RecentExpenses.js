import { formatAmount, monthNamesFa } from '../../utils.js';

export default function recentExpenses(monthExpenses) {
  const expensesContainer = document.getElementById("expensesList");
  expensesContainer.innerHTML = "";

  if (monthExpenses.length === 0) {
    expensesContainer.innerHTML = `<p style="text-align: center; color: #718096;">
      این ماه هنوز هزینه ای وارد نشده است.
      </p>`;
    return;
  }

  const recentExpenses = monthExpenses.slice(0, 10);

  recentExpenses.forEach((expense) => {
    const expenseElement = document.createElement("div");
    expenseElement.className = "expense-item";

    const [, jm, jd] = expense.persianDate.split("/").map(Number);

    expenseElement.innerHTML = `
        <div class="expense-details">
          <span class="expense-description">${expense.description}</span>
          <span class="expense-date">${jd} ${monthNamesFa[jm - 1]}</span>
        </div>
        <span class="expense-amount">${formatAmount(
          expense.amount
        )} تومان</span>
      `;

    expensesContainer.appendChild(expenseElement);
  });
}
