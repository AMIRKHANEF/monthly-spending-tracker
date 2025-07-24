class SpendingTracker {
  constructor() {
    this.currentJalaliDate = window.jalaali.toJalaali(new Date())
    this.expenses = this.loadExpenses()

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
    ]

    this.formatAmount = (amount) => {
      return Number(amount.toFixed(0)).toLocaleString("fa-IR")
    }

    this.init()
  }

  init() {
    this.updateDisplay()
    this.bindEvents()
    this.renderCalendar()
    this.renderRecentExpenses()
  }

  bindEvents() {
    document.getElementById("addExpense").addEventListener("click", () => this.addExpense())
    document.getElementById("expenseAmount").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addExpense()
    })
    document.getElementById("expenseDescription").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addExpense()
    })
    document.getElementById("prevMonth").addEventListener("click", () => this.changeMonth(-1))
    document.getElementById("nextMonth").addEventListener("click", () => this.changeMonth(1))
    document.getElementById("closeModal").addEventListener("click", () => this.closeModal())

    const amountInput = document.getElementById("expenseAmount")
    amountInput.addEventListener("input", (e) => {
      // Remove everything that's not a digit
      const onlyNumbers = e.target.value.replace(/\D/g, "")

      // Format with commas (e.g., 11000 -> 11,000)
      e.target.value = onlyNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    })

    // Close modal when clicking outside
    document.getElementById("dayModal").addEventListener("click", (e) => {
      if (e.target.id === "dayModal") this.closeModal()
    })
  }

  // Convert Gregorian date string to Persian date string
  gregorianToPersianDateKey(gregorianDateStr) {
    const gDate = new Date(gregorianDateStr)
    const jDate = window.jalaali.toJalaali(gDate)
    return `${jDate.jy}/${jDate.jm}/${jDate.jd}`
  }

  // Convert Persian date string to Gregorian date string
  persianToGregorianDateKey(persianDateStr) {
    const [jy, jm, jd] = persianDateStr.split("/").map(Number)
    const gDate = window.jalaali.toGregorian(jy, jm, jd)
    return `${gDate.gy}-${String(gDate.gm).padStart(2, "0")}-${String(gDate.gd).padStart(2, "0")}`
  }

  // Get today's Persian date key
  getTodayPersianKey() {
    const today = window.jalaali.toJalaali(new Date())
    return `${today.jy}/${today.jm}/${today.jd}`
  }

  // Migration function to convert old data format to new format
  migrateExpensesToPersianDates() {
    const oldExpenses = localStorage.getItem("monthlyExpenses")
    if (!oldExpenses) return {}

    const oldData = JSON.parse(oldExpenses)
    const newData = {}

    // Convert each date key from Gregorian to Persian
    Object.keys(oldData).forEach((gregorianDateKey) => {
      const persianDateKey = this.gregorianToPersianDateKey(gregorianDateKey)
      newData[persianDateKey] = oldData[gregorianDateKey]
    })

    // Save the migrated data
    localStorage.setItem("monthlyExpenses2", JSON.stringify(newData))

    console.log("Successfully migrated expenses from Gregorian to Persian calendar format")
    return newData
  }

  addExpense() {
    const amount = Number.parseFloat(document.getElementById("expenseAmount").value.replace(/,/g, ""))
    const description = document.getElementById("expenseDescription").value.trim()

    if (!amount || amount <= 0) {
      this.showError("لطفا مبلغ معتبری وارد کنید")
      return
    }

    if (!description) {
      this.showError("لطفا توضیحات را وارد کنید")
      return
    }

    const todayPersianKey = this.getTodayPersianKey()
    const expense = {
      id: Date.now(),
      persianDate: todayPersianKey,
      amount: amount,
      description: description,
      timestamp: new Date().toISOString(),
    }

    if (!this.expenses[todayPersianKey]) {
      this.expenses[todayPersianKey] = []
    }

    this.expenses[todayPersianKey].push(expense)
    this.saveExpenses()

    // Clear inputs
    document.getElementById("expenseAmount").value = ""
    document.getElementById("expenseDescription").value = ""

    // Add success animation
    const addBtn = document.getElementById("addExpense")
    addBtn.classList.add("pulse")
    setTimeout(() => addBtn.classList.remove("pulse"), 600)

    this.updateDisplay()
    this.renderCalendar()
    this.renderRecentExpenses()
  }

  showError(message) {
    alert(message)
  }

  changeMonth(direction) {
    // Navigate Persian calendar months
    let newMonth = this.currentJalaliDate.jm + direction
    let newYear = this.currentJalaliDate.jy

    if (newMonth > 12) {
      newMonth = 1
      newYear++
    } else if (newMonth < 1) {
      newMonth = 12
      newYear--
    }

    this.currentJalaliDate = { jy: newYear, jm: newMonth, jd: 1 }
    this.updateDisplay()
    this.renderCalendar()
    this.renderRecentExpenses()
  }

  updateDisplay() {
    const currentMonthStr = `${this.monthNamesFa[this.currentJalaliDate.jm - 1]} ${this.currentJalaliDate.jy}`
    document.getElementById("currentMonth").textContent = currentMonthStr

    // Get totals for ONLY the currently displayed month
    const monthlyTotal = this.getCurrentMonthTotal()
    const dailyAverage = this.getCurrentMonthDailyAverage()

    document.getElementById("totalSpent").textContent = `${this.formatAmount(monthlyTotal)} تومان`
    document.getElementById("dailyAverage").textContent = `${this.formatAmount(dailyAverage)} تومان`
  }

  // Get total for currently displayed Persian month
  getCurrentMonthTotal() {
    const currentYear = this.currentJalaliDate.jy
    const currentMonth = this.currentJalaliDate.jm
    let total = 0

    Object.keys(this.expenses).forEach((persianDateKey) => {
      const [year, month] = persianDateKey.split("/").map(Number)
      if (year === currentYear && month === currentMonth) {
        this.expenses[persianDateKey].forEach((expense) => {
          total += expense.amount
        })
      }
    })

    return total
  }

  // Calculate daily average for current displayed Persian month
  getCurrentMonthDailyAverage() {
    const monthlyTotal = this.getCurrentMonthTotal()
    const today = window.jalaali.toJalaali(new Date())
    const isCurrentMonth = today.jy === this.currentJalaliDate.jy && today.jm === this.currentJalaliDate.jm

    // Get days in Persian month
    const daysInMonth =
      this.currentJalaliDate.jm <= 6
        ? 31
        : this.currentJalaliDate.jm <= 11
          ? 30
          : window.jalaali.isLeapJalaaliYear(this.currentJalaliDate.jy)
            ? 30
            : 29

    // For current month, use days passed. For other months, use full month days
    const daysPassed = isCurrentMonth ? today.jd : daysInMonth

    return daysPassed > 0 ? monthlyTotal / daysPassed : 0
  }

  renderCalendar() {
    const calendar = document.getElementById("calendar")
    calendar.innerHTML = ""

    const jYear = this.currentJalaliDate.jy
    const jMonth = this.currentJalaliDate.jm

    const gStartDate = window.jalaali.toGregorian(jYear, jMonth, 1)
    const firstDay = new Date(gStartDate.gy, gStartDate.gm - 1, gStartDate.gd).getDay()

    const today = window.jalaali.toJalaali(new Date())
    const daysInMonth = jMonth <= 6 ? 31 : jMonth <= 11 ? 30 : window.jalaali.isLeapJalaaliYear(jYear) ? 30 : 29

    // Add empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement("div")
      calendar.appendChild(emptyDay)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const persianDateKey = `${jYear}/${jMonth}/${day}`
      const dayExpenses = this.expenses[persianDateKey] || []
      const dayTotal = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0)

      const dayElement = document.createElement("div")
      dayElement.className = "calendar-day"

      if (today.jy === jYear && today.jm === jMonth && today.jd === day) {
        dayElement.classList.add("today")
      }

      if (dayTotal > 0) {
        dayElement.classList.add("has-expense")
      }

      dayElement.innerHTML = `
      <span class="day-number">${day}</span>
      ${dayTotal > 0 ? `<span class="day-amount">${this.formatAmount(dayTotal)} ت</span>` : ""}
    `

      dayElement.addEventListener("click", () => this.showDayModal(persianDateKey))
      calendar.appendChild(dayElement)
    }
  }

  showDayModal(persianDateKey) {
    const dayExpenses = this.expenses[persianDateKey] || []
    const [jy, jm, jd] = persianDateKey.split("/").map(Number)

    document.getElementById("modalDate").textContent = `${this.monthNamesFa[jm - 1]} ${jd}، ${jy}`

    const dayExpensesContainer = document.getElementById("dayExpenses")
    dayExpensesContainer.innerHTML = ""

    if (dayExpenses.length === 0) {
      dayExpensesContainer.innerHTML = '<p style="text-align: center; color: #718096;">هزینه ای وارد نشده است</p>'
    } else {
      dayExpenses.forEach((expense) => {
        const expenseElement = document.createElement("div")
        expenseElement.className = "expense-item modal-expense-item"
        expenseElement.innerHTML = `
        <div class="expense-details">
          <span class="expense-description">${expense.description}</span>
          <span class="expense-date">${new Date(expense.timestamp).toLocaleTimeString()}</span>
        </div>
        <div class="expense-actions">
          <span class="expense-amount">${this.formatAmount(expense.amount)} تومان</span>
          <div class="action-buttons">
            <button class="edit-expense-btn" data-expense-id="${expense.id}" title="ویرایش">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="remove-expense-btn" data-expense-id="${expense.id}" title="حذف">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>
      `
        dayExpensesContainer.appendChild(expenseElement)
      })

      // Bind events for the new buttons
      this.bindModalEvents(persianDateKey)
    }

    const dayTotal = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    document.getElementById("dayTotal").textContent = `${this.formatAmount(dayTotal)} تومان`

    document.getElementById("dayModal").style.display = "block"
  }

  // Edit expense functionality
  editExpense(persianDateKey, expenseId) {
    const dayExpenses = this.expenses[persianDateKey] || []
    const expense = dayExpenses.find((exp) => exp.id === expenseId)

    if (!expense) return

    // Create edit form in modal
    const editForm = document.createElement("div")
    editForm.className = "edit-expense-form"
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
  `

    // Replace the modal content temporarily
    const modalBody = document.getElementById("dayExpenses")
    const originalContent = modalBody.innerHTML
    modalBody.innerHTML = ""
    modalBody.appendChild(editForm)

    // Handle amount input formatting
    const amountInput = document.getElementById("editAmount")
    amountInput.addEventListener("input", (e) => {
      const onlyNumbers = e.target.value.replace(/\D/g, "")
      e.target.value = onlyNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    })

    // Handle save
    document.getElementById("saveEdit").addEventListener("click", () => {
      const newAmount = Number.parseFloat(amountInput.value.replace(/,/g, ""))
      const newDescription = document.getElementById("editDescription").value.trim()

      if (!newAmount || newAmount <= 0) {
        this.showError("لطفا مبلغ معتبری وارد کنید")
        return
      }

      if (!newDescription) {
        this.showError("لطفا توضیحات را وارد کنید")
        return
      }

      // Update the expense
      expense.amount = newAmount
      expense.description = newDescription
      expense.lastModified = new Date().toISOString()

      this.saveExpenses()
      this.updateDisplay()
      this.renderCalendar()
      this.renderRecentExpenses()

      // Refresh the modal content
      this.showDayModal(persianDateKey)
    })

    // Handle cancel
    document.getElementById("cancelEdit").addEventListener("click", () => {
      modalBody.innerHTML = originalContent
      this.bindModalEvents(persianDateKey)
    })
  }

  // Remove expense functionality
  removeExpense(persianDateKey, expenseId) {
    if (!confirm("آیا از حذف این هزینه اطمینان دارید؟")) {
      return
    }

    const dayExpenses = this.expenses[persianDateKey] || []
    const expenseIndex = dayExpenses.findIndex((exp) => exp.id === expenseId)

    if (expenseIndex === -1) return

    // Remove the expense
    dayExpenses.splice(expenseIndex, 1)

    // If no expenses left for this day, remove the day entry
    if (dayExpenses.length === 0) {
      delete this.expenses[persianDateKey]
    }

    this.saveExpenses()
    this.updateDisplay()
    this.renderCalendar()
    this.renderRecentExpenses()

    // Refresh the modal content
    this.showDayModal(persianDateKey)
  }

  // Bind events for edit/remove buttons in modal
  bindModalEvents(persianDateKey) {
    const editButtons = document.querySelectorAll(".edit-expense-btn")
    const removeButtons = document.querySelectorAll(".remove-expense-btn")

    editButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // Get the expense ID from the button, not the SVG element
        const expenseId = Number.parseInt(btn.dataset.expenseId)
        this.editExpense(persianDateKey, expenseId)
      })
    })

    removeButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // Get the expense ID from the button, not the SVG element
        const expenseId = Number.parseInt(btn.dataset.expenseId)
        this.removeExpense(persianDateKey, expenseId)
      })
    })
  }

  closeModal() {
    document.getElementById("dayModal").style.display = "none"
  }

  renderRecentExpenses() {
    const expensesContainer = document.getElementById("expensesList")
    expensesContainer.innerHTML = ""

    // Get expenses for current displayed month only
    const currentMonthExpenses = this.getCurrentMonthExpenses()

    if (currentMonthExpenses.length === 0) {
      expensesContainer.innerHTML =
        '<p style="text-align: center; color: #718096;">این ماه هنوز هزینه ای وارد نشده است.</p>'
      return
    }

    // Show recent expenses for current month (up to 10)
    const recentExpenses = currentMonthExpenses.slice(0, 10)

    recentExpenses.forEach((expense) => {
      const expenseElement = document.createElement("div")
      expenseElement.className = "expense-item"

      const [jy, jm, jd] = expense.persianDate.split("/").map(Number)

      expenseElement.innerHTML = `
                <div class="expense-details">
                    <span class="expense-description">${expense.description}</span>
                    <span class="expense-date">${jd} ${this.monthNamesFa[jm - 1]}</span>
                </div>
                <span class="expense-amount">${this.formatAmount(expense.amount)} تومان</span>
            `

      expensesContainer.appendChild(expenseElement)
    })
  }

  // Get expenses for currently displayed Persian month
  getCurrentMonthExpenses() {
    const currentYear = this.currentJalaliDate.jy
    const currentMonth = this.currentJalaliDate.jm
    const monthExpenses = []

    Object.keys(this.expenses).forEach((persianDateKey) => {
      const [year, month] = persianDateKey.split("/").map(Number)
      if (year === currentYear && month === currentMonth) {
        this.expenses[persianDateKey].forEach((expense) => {
          monthExpenses.push({ ...expense, persianDate: persianDateKey })
        })
      }
    })

    // Sort by timestamp (most recent first)
    monthExpenses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return monthExpenses
  }

  loadExpenses() {
    // First check if the new format exists
    const newFormatData = localStorage.getItem("monthlyExpenses2")
    if (newFormatData) {
      return JSON.parse(newFormatData)
    }

    // If new format doesn't exist, check for old format and migrate
    const oldFormatData = localStorage.getItem("monthlyExpenses")
    if (oldFormatData) {
      console.log("Found old format data, migrating to Persian calendar format...")
      return this.migrateExpensesToPersianDates()
    }

    // If neither exists, return empty object
    return {}
  }

  saveExpenses() {
    localStorage.setItem("monthlyExpenses2", JSON.stringify(this.expenses))
  }
}

// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new SpendingTracker()
})
