/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mendefinisikan warna dari logo Anda
        'brand-primary': '#F97316',   // Oranye
        'brand-secondary': '#FBBF24', // Kuning/Amber
      }
    },
  },
  plugins: [],
}

