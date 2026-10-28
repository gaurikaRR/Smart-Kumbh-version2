/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          950: '#121711',
          900: '#182017',
          850: '#1C241B', // Primary Theme Background
          800: '#242D23', // Surface / Cards
          700: '#2D382B', // Borders & Dividers
          600: '#3D4A3C',
          500: '#526251',
          400: '#728570',
        },
        gold: {
          400: '#E5B842',
          500: '#D4A373', // Warm Gold / Amber Accent
          600: '#C28E58',
        },
        alert: {
          red: '#FF4D4D',
          hover: '#E63939',
        },
        charcoal: {
          900: '#0F130E',
          800: '#1A2119',
          100: '#E2E8F0',
        }
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        card: '10px',
        btn: '8px',
        input: '8px',
        modal: '12px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.45)',
        gold: '0 0 15px rgba(212, 163, 115, 0.2)',
      }
    },
  },
  plugins: [],
}
