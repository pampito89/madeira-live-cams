
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: '#0077B6',
        mountain: '#2E7D5B',
        sun: '#F4B942',
        navy: '#123047',
        panel: '#F2FAFC',
      },
    },
  },
  plugins: [],
}
