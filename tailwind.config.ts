import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        primaryGradientStart: "hsl(var(--primary-gradient-start))",
        primaryGradientEnd: "hsl(var(--primary-gradient-end))",
      },
    },
  },
};

export default config;
