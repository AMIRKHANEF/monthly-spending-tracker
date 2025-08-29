export const themeLocalStorageKey = "METthemeSettings";

export const expensesLocalStorageKey = "monthlyExpenses2";

export const oldExpensesLocalStorageKey = "monthlyExpenses";

export const themes = {
  nowruz: {
    name: "نوروز",
    months: [1], // Farvardin
    colors: {
      primary: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
      secondary: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      accent: "rgba(72, 187, 120, 1)",
      text: "#2d3748",
      select: "rgba(72, 187, 120, 0.4)",
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
      select: "rgba(72, 187, 120, 0.4)",
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
      accent: "rgba(237, 137, 54, 1)",
      text: "#744210",
      select: "rgba(237, 137, 54, 0.4)",
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
      accent: "rgba(214, 158, 46, 1)",
      text: "#744210",
      select: "rgba(214, 158, 46, 0.4)",
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
      accent: "rgba(66, 153, 225, 1)",
      text: "#2a4365",
      select: "rgba(66, 153, 225, 0.4)",
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
      accent: "rgba(229, 62, 62, 1)",
      text: "#742a2a",
      select: "rgba(229, 62, 62, 0.4)",
    },
    decorations: "🍎🍇🕯️📚",
    greeting: "شب یلدایتان مبارک",
    quote: "شب یلدا، شب عشق و مهربانی، شب گردهمایی و شیرینی",
    specialMessage:
      "شب یلدا، شب خانواده است. هزینه‌های مهمانی را برنامه‌ریزی کنید!",
  },
};
