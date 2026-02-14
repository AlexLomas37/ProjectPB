/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Convert this to a glob pattern that matches your project structure
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
