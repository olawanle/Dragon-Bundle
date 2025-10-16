/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#38e07b",
        "background-light": "#f6f8f7",
        "background-dark": "#122017",
        "text-light": "#111714",
        "text-dark": "#e8ebe9",
        "subtle-light": "#f0f4f2",
        "subtle-dark": "#1a2c20"
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
