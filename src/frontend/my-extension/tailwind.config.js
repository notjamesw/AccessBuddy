/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",       // If you're using Vite, this is crucial
    "./src/**/*.{js,ts,jsx,tsx}" // Include all React components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};