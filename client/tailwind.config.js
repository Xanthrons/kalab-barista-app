/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        coffee: {
          bg: "#1a110a",
          "bg-deep": "#130c07",
          card: "#2b1c13",
          accent: "#d4a373",
          text: "#fefae0",
          muted: "#e7d8c4",
          border: "#4c3325",
          "border-light": "#5d4037"
        }
      },
      boxShadow: {
        glow: "0 22px 55px rgba(0, 0, 0, 0.28)",
        soft: "0 12px 28px rgba(15, 10, 6, 0.32)",
        "inner-light": "inset 0 1px 0 rgba(255, 250, 230, 0.1)"
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Cormorant Garamond", "serif"]
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
