import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        violet: {
          100: "#E4DBFF",
          300: "#C4AEFF",
          400: "#8A6BFF",
          600: "#5B2EE8",
          700: "#4A21D6",
          800: "#3F1BB0",
        },
        lavender: { 50: "#F6F3FF" },
        ink: { DEFAULT: "#1A1033", 2: "#4A4366" },
        success: { DEFAULT: "#177A42", bg: "#E6F4EC" },
        error: { DEFAULT: "#B4471A", bg: "#FBE4DA" },
      },
      fontFamily: {
        title: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
        corps: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "18px" },
      boxShadow: {
        soft: "0 18px 50px -20px rgba(91,46,232,.28)",
        floating: "0 26px 70px -28px rgba(26,16,51,.35)",
      },
      keyframes: {
        derive1: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(9vw,6vh,0) scale(1.12)" },
        },
        derive2: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1.08)" },
          "50%": { transform: "translate3d(-11vw,-5vh,0) scale(.94)" },
        },
        derive3: {
          "0%,100%": { transform: "translate3d(0,0,0) rotate(0deg)" },
          "50%": { transform: "translate3d(6vw,-9vh,0) rotate(24deg)" },
        },
        appear: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        derive1: "derive1 19s ease-in-out infinite",
        derive2: "derive2 22s ease-in-out infinite",
        derive3: "derive3 16s ease-in-out infinite",
        appear: "appear .35s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
