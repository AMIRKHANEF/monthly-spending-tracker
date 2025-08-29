import { formatAmount, monthNamesFa } from "../../utils.js";
import showNotification from "./ShowNotification.js";
import showThemeSelector from "./ThemeSelector.js";

export class UIManager {
  constructor(spendingTracker) {
    this.tracker = spendingTracker;

    this.showThemeSelector = showThemeSelector;
  }

  bindEvents() {
    // Navigation events
    document.getElementById("nextMonth").addEventListener("click", () => {
      this.tracker.navigateMonth("next");
    });

    document.getElementById("prevMonth").addEventListener("click", () => {
      this.tracker.navigateMonth("prev");
    });

    // Expense form events
    document.getElementById("addExpense").addEventListener("click", () => {
      this.handleAddExpense();
    });

    // Enter key support for expense form
    document
      .getElementById("expenseAmount")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.handleAddExpense();
      });
    document
      .getElementById("expenseDescription")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.handleAddExpense();
      });

    // Modal events
    document.getElementById("closeModal").addEventListener("click", () => {
      document.getElementById("dayModal").style.display = "none";
    });

    // Theme events
    document.getElementById("themeToggle").addEventListener("click", () => {
      this.showThemeSelector(this.tracker, showNotification);
    });

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
      const dayModal = document.getElementById("dayModal");
      const monthModal = document.getElementById("monthExpensesModal");

      if (e.target === dayModal) {
        dayModal.style.display = "none";
      }
      if (e.target === monthModal) {
        monthModal.style.display = "none";
      }
    });

    // Expense removal events (delegated)
    document.addEventListener("click", (e) => {
      if (e.target.closest(".remove-expense-btn")) {
        const btn = e.target.closest(".remove-expense-btn");
        const persianDate = btn.dataset.date;
        const expenseId = Number.parseInt(btn.dataset.id);
        this.handleRemoveExpense(persianDate, expenseId);
      }
    });
  }

  handleAddExpense() {
    const amountInput = document.getElementById("expenseAmount");
    const descriptionInput = document.getElementById("expenseDescription");

    const amount = Number.parseFloat(amountInput.value);
    const description = descriptionInput.value.trim();

    if (this.tracker.addExpense(amount, description)) {
      showNotification("هزینه با موفقیت اضافه شد", "success");
    } else {
      showNotification("لطفاً مبلغ و توضیحات را وارد کنید", "error");
    }
  }

  handleRemoveExpense(persianDate, expenseId) {
    // Show confirmation modal
    const expenses = this.tracker.dataManager.loadExpenses();
    const expense = expenses[persianDate]?.find((exp) => exp.id === expenseId);

    if (expense) {
      this.showConfirmModal(() => {
        if (this.tracker.removeExpense(persianDate, expenseId)) {
          showNotification("هزینه حذف شد", "success");
          document.getElementById("dayModal").style.display = "none";
        }
      }, expense);
    }
  }

  clearExpenseForm() {
    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseDescription").value = "";
  }

  updateMonthDisplay(jalaliDate) {
    const currentMonthElement = document.getElementById("currentMonth");
    currentMonthElement.textContent = `${monthNamesFa[jalaliDate.jm - 1]} ${
      jalaliDate.jy
    }`;
  }

  updateSummary(total, dailyAverage) {
    document.getElementById("totalSpent").textContent = `${formatAmount(
      total
    )} تومان`;

    document.getElementById("dailyAverage").textContent = `${formatAmount(
      Math.round(dailyAverage)
    )} تومان`;
  }

  showConfirmModal(onConfirm, expenseData) {
    const modal = document.getElementById("confirmModal");
    const expensePreview = document.getElementById("expenseToDelete");

    expensePreview.innerHTML = `
      <div class="expense-description">${expenseData.description}</div>
      <div class="expense-amount">${formatAmount(
        expenseData.amount
      )} تومان</div>
    `;

    const confirmBtn = document.getElementById("confirmDelete");
    const cancelBtn = document.getElementById("cancelDelete");
    const closeBtn = document.getElementById("closeConfirmModal");

    // Remove existing event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    const newCloseBtn = closeBtn.cloneNode(true);

    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

    // Add new event listeners
    newConfirmBtn.addEventListener("click", () => {
      onConfirm();
      modal.style.display = "none";
    });

    newCancelBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    newCloseBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    modal.style.display = "block";
  }
}
