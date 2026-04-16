/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        admin: {
          bg: "#0f1115",
          panel: "#161a21",
          soft: "#1d232d",
          accent: "#d4a373",
          text: "#f4f1ea",
          muted: "#a7abb4",
          border: "#2a313d",
          success: "#4ade80",
          warning: "#fbbf24",
          danger: "#fb7185"
        }
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        panel: "0 18px 48px rgba(0,0,0,0.22)"
      }
    }
  },
  plugins: []
};
