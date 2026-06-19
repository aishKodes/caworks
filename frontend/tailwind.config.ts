import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        muted: "#5c5f66",
        paper: "#fffaf7",
        line: "#e7e1dd",
        brand: {
          50: "#fff2f1",
          100: "#ffe2df",
          500: "#be1e2d",
          600: "#a41624",
          700: "#86111d",
          900: "#3b070d"
        },
        charcoal: {
          900: "#111111",
          800: "#1f1f1f",
          700: "#2f3033"
        }
      },
      boxShadow: {
        premium: "0 24px 70px rgba(17, 17, 17, 0.10)",
        soft: "0 14px 36px rgba(17, 17, 17, 0.08)",
        red: "0 16px 36px rgba(190, 30, 45, 0.22)"
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.35rem"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
