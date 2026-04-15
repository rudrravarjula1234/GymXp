/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        surface: "#13131A",
        card: "#1C1C27",
        primary: "#7B5EA7",
        accent: "#FF6B35",
        xpGold: "#FFD700",
        streakFire: "#FF4500",
        textPrimary: "#FFFFFF",
        textSecondary: "#A0A0B0",
        success: "#4CAF50",
        error: "#F44336",
        border: "#2A2A3A",
      },
    },
  },
  plugins: [],
};
