import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15202b",
        steel: "#4d6375",
        signal: "#f4b740",
        route: "#1d8f72",
        asphalt: "#101820"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(16, 24, 32, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
