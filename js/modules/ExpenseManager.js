import { getDaysInMonth } from "../utils.js";

export class ExpenseManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
  }

  addExpense(amount, description, currentDate) {
    if (!amount || amount <= 0 || !description.trim()) {
      return false;
    }

    const persianDateKey = `${currentDate.jy}/${currentDate.jm}/${currentDate.jd}`;
    const expense = {
      id: Date.now(),
      amount: Number.parseFloat(amount),
      description: description.trim(),
      timestamp: new Date().toISOString(),
    };

    const expenses = this.dataManager.loadExpenses();

    if (!expenses[persianDateKey]) {
      expenses[persianDateKey] = [];
    }

    expenses[persianDateKey].push(expense);
    this.dataManager.saveExpenses(expenses);

    return true;
  }

  removeExpense(persianDate, expenseId) {
    const expenses = this.dataManager.loadExpenses();

    if (expenses[persianDate]) {
      expenses[persianDate] = expenses[persianDate].filter(
        (expense) => expense.id !== expenseId
      );

      if (expenses[persianDate].length === 0) {
        delete expenses[persianDate];
      }

      this.dataManager.saveExpenses(expenses);

      return true;
    }

    return false;
  }

  getMonthTotal(jalaliDate) {
    const expenses = this.dataManager.loadExpenses();
    const currentYear = jalaliDate.jy;
    const currentMonth = jalaliDate.jm;
    let total = 0;

    Object.keys(expenses).forEach((persianDateKey) => {
      const [year, month] = persianDateKey.split("/").map(Number);
      if (year === currentYear && month === currentMonth) {
        expenses[persianDateKey].forEach((expense) => {
          total += expense.amount;
        });
      }
    });

    return total;
  }

  getDailyAverage(jalaliDate) {
    const monthlyTotal = this.getMonthTotal(jalaliDate);
    const today = window.jalaali.toJalaali(new Date());
    const isCurrentMonth =
      today.jy === jalaliDate.jy && today.jm === jalaliDate.jm;

    const daysInMonth = getDaysInMonth(jalaliDate.jy, jalaliDate.jm);
    const daysPassed = isCurrentMonth ? today.jd : daysInMonth;

    return daysPassed > 0 ? monthlyTotal / daysPassed : 0;
  }

  getCurrentMonthExpenses(jalaliDate) {
    const expenses = this.dataManager.loadExpenses();
    const currentYear = jalaliDate.jy;
    const currentMonth = jalaliDate.jm;
    const monthExpenses = [];

    Object.keys(expenses).forEach((persianDateKey) => {
      const [year, month] = persianDateKey.split("/").map(Number);
      if (year === currentYear && month === currentMonth) {
        expenses[persianDateKey].forEach((expense) => {
          monthExpenses.push({ ...expense, persianDate: persianDateKey });
        });
      }
    });

    monthExpenses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return monthExpenses;
  }

  getDayExpenses(persianDate) {
    const expenses = this.dataManager.loadExpenses();
    return expenses[persianDate] || [];
  }
}
