/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          900: "#102a43",
          700: "#1f4d7a",
          500: "#2d6ea5",
          100: "#d9ecfb",
        },
      },
      fontFamily: {
        sans: ["Space Grotesk", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 20px 45px -30px rgba(16, 42, 67, 0.6)",
      },
    },
  },
  plugins: [],
};
