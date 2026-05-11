/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#1A4D2E', // Deep Forest Green
          brown: '#8B5A2B', // Warm Earthy Brown
          cream: '#FDFBF7', // Cream / Off-white
        }
      }
    },
  },
  plugins: [],
}