/** @type {import('tailwindcss').Config} */
// Paleta mójMińsk v2 — źródło: #F0EFF4 · #EBC999 · #8CA9D3 · #F26659
// Na kolorowych powierzchniach używamy tekstu `ink` (biały tekst nie spełnia kontrastu 4.5:1).
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mist: { DEFAULT: '#F0EFF4', 200: '#E6E4ED', 300: '#D5D2E0' },
        sand: { 50: '#FCF7EF', 100: '#F7ECDA', 200: '#F1DDBC', DEFAULT: '#EBC999', 600: '#D4A866', 700: '#80602D' },
        sky: { 50: '#F1F5FA', 100: '#E0E8F4', 200: '#C3D3E9', DEFAULT: '#8CA9D3', 600: '#6B8BBB', 700: '#3D5C8C' },
        coral: { 50: '#FEF2F0', 100: '#FDDFDB', 200: '#FAC0B9', DEFAULT: '#F26659', 600: '#E04E41', 700: '#B3372C' },
        ink: { DEFAULT: '#1F1D2B', 700: '#3B3848', 500: '#6B6879', 400: '#918EA0', 300: '#BCB9C8' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: { '4xl': '2rem' },
      spacing: {
        13: '3.25rem', // 52px (standardowy touch target)
        14: '3.5rem',  // 56px (pełny mobilny CTA)
      },
      boxShadow: {
        card: '0 1px 2px rgba(31,29,43,.04), 0 10px 24px -14px rgba(31,29,43,.18)',
        float: '0 20px 40px -14px rgba(31,29,43,.45)',
        coral: '0 12px 24px -10px rgba(242,102,89,.65)',
      },
    },
  },
  plugins: [],
};
