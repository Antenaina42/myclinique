import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcdbff",
          300: "#8ec4ff",
          400: "#58a3ff",
          500: "#1677FF", // Main Primary
          600: "#1360db",
          700: "#0f4c81", // Secondary
          800: "#0c3b65",
          900: "#092a49",
        },
        secondary: {
          DEFAULT: "#0F4C81",
          light: "#1866ad",
          dark: "#0a3459",
        },
        accent: {
          DEFAULT: "#20C997",
          hover: "#18b083",
          light: "#e6fcf5",
        },
        clinic: {
          bg: "#F5F8FC",
          card: "#FFFFFF",
          text: "#1F2937",
          muted: "#6B7280",
          border: "#E5E7EB",
          darkBg: "#0F172A",
          darkCard: "#1E293B",
          darkBorder: "#334155",
        },
      },
      boxShadow: {
        duralux: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        "duralux-md": "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
        "duralux-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
      },
      borderRadius: {
        duralux: "0.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
