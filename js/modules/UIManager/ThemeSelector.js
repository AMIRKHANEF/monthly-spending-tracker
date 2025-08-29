export default function showThemeSelector(tracker, showNotification) {
  const currentTheme = tracker.getEffectiveTheme();
  const culturalThemes = tracker.culturalThemes.culturalThemes;
  const isThemeEnabled = tracker.isThemeEnabled;
  const manualTheme = tracker.manualTheme;

  const modal = document.createElement("div");

  modal.className = "modal theme-selector-modal";
  modal.id = "themeModal";
  modal.style.display = "block";

  const isAuto = isThemeEnabled && !manualTheme;

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
                  isThemeEnabled ? "checked" : ""
                }>
                <span class="theme-toggle-slider"></span>
                <span class="theme-toggle-text">تم‌های فرهنگی فارسی</span>
              </label>
              <p class="theme-toggle-description">
                ${
                  isThemeEnabled
                    ? "تم‌ها بر اساس تقویم فارسی و فصول تغییر می‌کنند"
                    : "استفاده از تم ساده و یکنواخت"
                }
              </p>
            </div>
          </div>

          ${
            isThemeEnabled
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

                ${Object.keys(culturalThemes)
                  .map((themeKey) => {
                    const theme = culturalThemes[themeKey];
                    const isActive = manualTheme === themeKey;
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
    .addEventListener("change", () => {
      document.body.removeChild(modal);
      tracker.toggleTheme();
    });

  // Handle theme selection
  modal.querySelectorAll(".theme-option").forEach((option) => {
    option.addEventListener("click", () => {
      const themeKey = option.dataset.theme;

      if (themeKey === "auto") {
        tracker.resetToAutoTheme();
      } else {
        tracker.setManualTheme(themeKey);
      }

      document.body.removeChild(modal);
      showNotification("تم با موفقیت تغییر کرد!", "success");
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
