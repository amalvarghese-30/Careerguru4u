import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#041C4A',
          royal: '#0056D2',
          electric: '#008CFF',
          sky: '#3ECFFF',
          white: '#FFFFFF',
          bg: '#F7FAFF',
          dark: '#0F172A',
        },
        primary: {
          DEFAULT: '#0056D2',
          dark: '#041C4A',
          light: '#008CFF',
          surface: '#F7FAFF',
          mist: '#EEF2FF',
          50: '#EEF2FF',
          100: '#DCE4FD',
          200: '#B8C9FB',
          300: '#85A5F8',
          400: '#5C85F3',
          500: '#0056D2',
          600: '#0045B8',
          700: '#041C4A',
          800: '#031738',
          900: '#021026',
        },
        accent: {
          sky: '#3ECFFF',
          electric: '#008CFF',
          success: '#22C55E',
          warning: '#F59E0B',
        },
        neutral: {
          white: '#FFFFFF',
          offWhite: '#F7FAFF',
          lightGray: '#E2E8F0',
          mediumGray: '#94A3B8',
          darkGray: '#334155',
          nearBlack: '#0F172A',
        },
      },
      fontFamily: {
        sora: ['var(--font-sora)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '20px',
        '3xl': '28px',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #041C4A 0%, #0056D2 45%, #008CFF 75%, #3ECFFF 100%)',
        'blue-glow': 'linear-gradient(135deg, #0056D2 0%, #008CFF 100%)',
        'card-glow': 'linear-gradient(135deg, rgba(4,28,74,0.04) 0%, rgba(0,140,255,0.06) 100%)',
      },
      backgroundSize: {
        '200': '200% 200%',
      },
      boxShadow: {
        'brand': '0 8px 32px rgba(4, 28, 74, 0.08)',
        'brand-hover': '0 18px 48px rgba(4, 28, 74, 0.12), 0 0 24px rgba(0, 140, 255, 0.1)',
        'brand-btn': '0 8px 24px rgba(0, 86, 210, 0.25)',
        'brand-btn-hover': '0 14px 36px rgba(0, 86, 210, 0.35), 0 0 24px rgba(0, 140, 255, 0.18)',
        'brand-glow': '0 0 24px rgba(0, 140, 255, 0.15)',
        'brand-glow-lg': '0 0 40px rgba(0, 140, 255, 0.15), 0 0 80px rgba(0, 86, 210, 0.08)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'float 3s ease-in-out 1.5s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0, 86, 210, 0.2)' },
          '50%': { boxShadow: '0 0 24px rgba(0, 140, 255, 0.4)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
}

export default config
