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
        green_pastel: "#E8F5E9",
        green_pastel2: "rgb(246, 250, 246)",
        cyan_border: "#0F8480",
        cyan_pastel: "#F2FDFD",
        cyan_text: "#0F8480",
        red_text: "#EA2B2B",
        red_pastel: "#FFDFE0"
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
