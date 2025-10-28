import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      boxShadow: {
        'glow': '0 0 20px rgba(var(--primary-rgb), 0.2), inset 0 0 20px rgba(var(--primary-rgb), 0.1)',

// [NOX-DEV-4]: ongoing module refinement
