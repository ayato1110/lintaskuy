/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1220',
        muted: '#526070',
        border: '#D8E0E8',
        surface: '#FFFFFF',
        'surface-subtle': '#F6F8FB',
        primary: '#2563EB',
        'primary-strong': '#1D4ED8',
        teal: '#0F766E',
        success: '#15803D',
        warning: '#B45309',
        danger: '#B91C1C',
        info: '#0369A1',
      },
      borderRadius: {
        control: '8px',
        card: '12px',
        pill: '999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        content: '1280px',
      },
      lineHeight: {
        display: '1.2',
      },
      fontSize: {
        display: ['40px', '48px'],
        'display-mobile': ['32px', '40px'],
      },
    },
  },
  plugins: [],
};