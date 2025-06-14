import { heroui } from "@heroui/theme";
import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        branding1: {
          DEFAULT: "#4B1115",
          500: "#4B1115", // Same as DEFAULT
        },
        branding2: {
          DEFAULT: "#FBAE35",
          500: "#FBAE35", // Same as DEFAULT
        },
        branding3: {
          DEFAULT: "#711E23",
          500: "#711E23", // Same as DEFAULT
        },
        branding4: {
          DEFAULT: "#FFE4AA",
          500: "#FFE4AA", // Same as DEFAULT
        },
        branding5: {
          DEFAULT: "#FFF8EA",
          500: "#FFF8EA", // Same as DEFAULT
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
  corePlugins: {
    filter: true,
  },
};
