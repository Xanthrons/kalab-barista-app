/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        coffee: {
          bg: "rgb(var(--coffee-bg-rgb) / <alpha-value>)",
          "bg-deep": "rgb(var(--coffee-bg-deep-rgb) / <alpha-value>)",
          card: "rgb(var(--coffee-card-rgb) / <alpha-value>)",
          accent: "rgb(var(--coffee-accent-rgb) / <alpha-value>)",
          text: "rgb(var(--coffee-text-rgb) / <alpha-value>)",
          muted: "rgb(var(--coffee-muted-rgb) / <alpha-value>)",
          border: "rgb(var(--coffee-border-rgb) / <alpha-value>)",
          "border-light": "rgb(var(--coffee-border-light-rgb) / <alpha-value>)"
        }
      },
      boxShadow: {
        glow: "0 22px 55px rgba(0, 0, 0, 0.28)",
        soft: "0 12px 28px rgba(15, 10, 6, 0.32)",
        "inner-light": "inset 0 1px 0 rgba(255, 250, 230, 0.1)"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      },
      backgroundImage: {
        beans:
          "radial-gradient(circle at top left, rgba(212, 163, 115, 0.22), transparent 35%), radial-gradient(circle at bottom right, rgba(255, 245, 230, 0.08), transparent 30%)",
        "coffee-texture": "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"20\" cy=\"20\" r=\"2\" fill=\"rgba(212,163,115,0.1)\"/><circle cx=\"80\" cy=\"60\" r=\"1.5\" fill=\"rgba(212,163,115,0.15)\"/><circle cx=\"60\" cy=\"80\" r=\"1\" fill=\"rgba(212,163,115,0.12)\"/><circle cx=\"40\" cy=\"40\" r=\"1.8\" fill=\"rgba(212,163,115,0.08)\"/></svg>')"
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        }
      }
    }
  },
  plugins: []
};
