import { themes } from "../constants.js";

export class CulturalThemes {
  constructor() {
    this.culturalThemes = themes;
  }

  getCurrentTheme(jalaliDate) {
    const month = jalaliDate.jm;

    // Check for specific cultural events first
    for (const [, theme] of Object.entries(this.culturalThemes)) {
      if (theme.months && theme.months.includes(month)) {
        return theme;
      }
    }

    return this.getDefaultTheme();
  }

  getTheme(themeName) {
    return this.culturalThemes[themeName] || this.getDefaultTheme();
  }

  getDefaultTheme() {
    return {
      name: "پیش‌فرض",
      colors: {
        primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        secondary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        accent: "#667eea",
        text: "#333",
        select: "rgba(102, 126, 234, 0.4)",
      },
      decorations: "",
      greeting: "مدیریت هزینه‌های ماهانه",
      quote: "",
      specialMessage: "",
    };
  }

  applyTheme(theme) {
    const root = document.documentElement;
    root.style.setProperty("--theme-primary", theme.colors.primary);
    root.style.setProperty("--theme-secondary", theme.colors.secondary);
    root.style.setProperty("--theme-accent", theme.colors.accent);
    root.style.setProperty("--theme-text", theme.colors.text);
    root.style.setProperty("--theme-select", theme.colors.select);

    this.updateCulturalHeader(theme);
  }

  updateCulturalHeader(theme) {
    let culturalHeader = document.querySelector(".cultural-header");

    if (
      theme.decorations ||
      theme.greeting ||
      theme.quote ||
      theme.specialMessage
    ) {
      if (!culturalHeader) {
        culturalHeader = document.createElement("div");
        culturalHeader.className = "cultural-header";
        document.querySelector(".header").after(culturalHeader);
      }

      culturalHeader.innerHTML = `
        ${
          theme.decorations
            ? `<div class="cultural-decorations">${theme.decorations}</div>`
            : ""
        }
        ${
          theme.greeting
            ? `<div class="cultural-greeting">${theme.greeting}</div>`
            : ""
        }
        ${theme.quote ? `<div class="cultural-quote">${theme.quote}</div>` : ""}
        ${
          theme.specialMessage
            ? `<div class="cultural-message">${theme.specialMessage}</div>`
            : ""
        }
      `;
    } else if (culturalHeader) {
      culturalHeader.remove();
    }
  }
}
