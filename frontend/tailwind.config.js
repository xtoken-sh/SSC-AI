/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        revealCurtain: {
          '0%': {
            opacity: '0',
            transform: 'translateY(1.25rem) scale(0.98)',
            filter: 'blur(12px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
            filter: 'blur(0)',
          },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 24px rgba(251, 191, 36, 0.12)' },
          '50%': { boxShadow: '0 0 48px rgba(251, 191, 36, 0.28)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(0.75rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        messageIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        loadingBar: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(280%)' },
        },
        softPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        },
      },
      animation: {
        revealCurtain: 'revealCurtain 1.35s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        glowPulse: 'glowPulse 3.2s ease-in-out infinite',
        fadeIn: 'fadeIn 0.8s ease-out forwards',
        spin: 'spin 0.85s linear infinite',
        slideInUp: 'slideInUp 0.35s ease-out forwards',
        messageIn: 'messageIn 0.35s ease-out forwards',
        loadingBar: 'loadingBar 1.15s ease-in-out infinite',
        softPulse: 'softPulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

