/** @type {import('tailwindcss').Config} */
export default {
  // 1. MUST be at the root level
  darkMode: 'class', 
  
  // 2. MUST include all file extensions you use
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