/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F3F0FF',
          100: '#E9E4FF',
          200: '#D5CCFF',
          300: '#B5A3FF',
          400: '#9270FF',
          500: '#6D4AFF',
          600: '#5A36EA',
          700: '#4827C7',
          800: '#381E9E',
          900: '#2A1673',
          DEFAULT: '#6D4AFF',
        },
        sidebar: {
          DEFAULT: '#17172F',
          dark: '#111124',
          hover: '#222240',
          active: '#6D4AFF',
          border: '#272746',
          text: '#98A2B3',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8FAFC',
          dark: '#1E1E38',
        },
        appbg: {
          DEFAULT: '#F6F7FB',
          dark: '#0F0F1E',
        },
        brandText: {
          DEFAULT: '#20243A',
          secondary: '#64748B',
          dark: '#F1F5F9',
        },
        erpSuccess: '#16A34A',
        erpWarning: '#F59E0B',
        erpDanger: '#DC2626',
        erpInfo: '#2563EB',
      },
      boxShadow: {
        'card': '0 2px 10px rgba(109, 74, 255, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 10px 25px -5px rgba(109, 74, 255, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'dropdown': '0 10px 30px rgba(0, 0, 0, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
