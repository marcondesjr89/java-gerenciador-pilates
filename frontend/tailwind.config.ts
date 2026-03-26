import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--brand-primary)",
          primaryHover: "var(--brand-primary-hover)",
          secondary: "var(--brand-secondary)",
          soft: "var(--brand-soft)",
          ink: "var(--brand-ink)",
          subtext: "var(--brand-subtext)",
          surface: "var(--brand-surface)",
          muted: "var(--brand-muted)",
          panel: "var(--brand-panel)",
          line: "var(--brand-line)",
          success: "var(--brand-success)",
          warning: "var(--brand-warning)",
          danger: "var(--brand-danger)",
          info: "var(--brand-info)",
          sidebar: "var(--brand-sidebar)",
          sidebarSoft: "var(--brand-sidebar-soft)"
        }
      },
      boxShadow: {
        panel: "0 24px 60px -28px rgba(109, 33, 60, 0.16)"
      },
      fontFamily: {
        sans: ["Aptos", "\"Segoe UI Variable\"", "\"Trebuchet MS\"", "sans-serif"],
        display: ["\"Palatino Linotype\"", "\"Book Antiqua\"", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
