/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1B5E20",
        secondary: "#008000",
        green_border: "#139139",
        green_bg: "#8AD459",
        green_pastel: "#E8F5E9"
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
