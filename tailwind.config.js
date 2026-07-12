/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#202522',
        ocean: '#24563D',
        panel: '#F5F1E8',

        forest: '#173D2B',
        leaf: '#4E7D59',
        moss: '#B7CBAA',
        clay: '#D49A69',
        lava: '#A94B34',
        mist: '#E7EDE4',
      },
    },
  },
  plugins: [],
};