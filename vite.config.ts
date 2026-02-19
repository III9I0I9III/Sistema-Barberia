/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",         // entry HTML
    "./src/**/*.{js,ts,jsx,tsx}", // todos los archivos JS/TS/JSX/TSX
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1d4ed8",    // azul principal
        secondary: "#f59e0b",  // naranja
        accent: "#10b981",     // verde acento
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["Fira Code", "ui-monospace", "monospace"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out",
      },
    },
  },
  plugins: [],
  darkMode: "class", // si quieres modo oscuro por clase
};
