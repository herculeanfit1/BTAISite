/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5B90B0",
          dark: "#3A5F77",
        },
        secondary: {
          DEFAULT: "#BFC5C8",
          50: "#F8F9FA",
          100: "#D8DADC",
          200: "#BFC5C8",
          300: "#9CAEB8",
          400: "#7A97A7",
          500: "#5B90B0",
          600: "#4A7C9A",
          700: "#3A5F77",
          800: "#2A4558",
          900: "#1F1F25",
        },
        accent: "#9CAEB8",
        dark: "#1F1F25",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
