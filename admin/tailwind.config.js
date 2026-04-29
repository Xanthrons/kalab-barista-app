/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        admin: {
          // Dark mode (default)
          bg:      "var(--admin-bg)",
          panel:   "var(--admin-panel)",
          soft:    "var(--admin-soft)",
          accent:  "var(--admin-accent)",
          text:    "var(--admin-text)",
          muted:   "var(--admin-muted)",
          border:  "var(--admin-border)",
          success: "var(--admin-success)",
          warning: "var(--admin-warning)",
          danger:  "var(--admin-danger)",
        }
      },
      fontFamily: { sans: ["Manrope", "sans-serif"] },
      boxShadow: { panel: "0 18px 48px rgba(0,0,0,0.22)" }
    }
  },
  plugins: []
};
