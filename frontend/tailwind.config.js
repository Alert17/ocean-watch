/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        abyss: {
          950: "#030910",
          900: "#061222",
          850: "#0a1a2e",
          800: "#0c2744",
          700: "#123a5c",
        },
        lagoon: {
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
        },
        reef: {
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
        },
        foam: "#e0f2fe",
        coral: {
          400: "#fb7185",
          500: "#f43f5e",
        },
        kelp: "#0f766e",
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      backgroundImage: {
        "ocean-radial":
          "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(14,165,233,0.25), transparent 55%)",
        "depth-fade":
          "linear-gradient(180deg, rgba(6,18,34,0.2) 0%, rgba(3,9,16,0.95) 100%)",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(45,212,191,0.35)",
        card: "0 4px 24px -8px rgba(2,8,23,0.5)",
      },
    },
  },
  plugins: [],
};
