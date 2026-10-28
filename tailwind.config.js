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
          50: '#F4F6F4',
          100: '#E6EBE6',
          200: '#CCD8CD',
          300: '#AABEA8',
          400: '#7E9C7B',
          500: '#5A7557',
          600: '#465D44',
          700: '#3D4A3E', // deep olive
          800: '#2E3B2F', // rich primary olive
          900: '#242E25',
          950: '#171E18',
        },
        sand: {
          50: '#FAF9F6',
          100: '#F7F5F0', // warm sand / cream canvas
          200: '#EFECE6',
          300: '#E4DFC8',
          400: '#D5CCB5',
        },
        gold: {
          50: '#FBF7EE',
          100: '#F6EED8',
          200: '#ECDAB2',
          300: '#DFC286',
          400: '#D4A373', // muted gold accent
          500: '#C59B27', // amber gold
          600: '#B0881E',
          700: '#8A6814',
        },
        charcoal: {
          50: '#F3F4F3',
          100: '#E2E4E2',
          200: '#C2C6C3',
          300: '#9EA49F',
          400: '#6E7670',
          500: '#4F5751',
          600: '#3C443E',
          700: '#2E3530',
          800: '#242B26',
          900: '#1A201C', // off-black body
          950: '#111512',
        },
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"IBM Plex Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      boxShadow: {
        'soft': '0 10px 30px rgba(0, 0, 0, 0.06)',
        'card': '0 4px 20px -2px rgba(46, 59, 47, 0.07), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 14px 34px -4px rgba(46, 59, 47, 0.14), 0 6px 12px -2px rgba(46, 59, 47, 0.06)',
        'elevated': '0 20px 40px -8px rgba(46, 59, 47, 0.16)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
