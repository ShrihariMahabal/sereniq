/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")], // <-- This line is mandatory!
  theme: {
    extend: {
      colors: {
        background: '#121212',
        primary: '#00D6A3',
      },
    },
  },
  plugins: [],
};
