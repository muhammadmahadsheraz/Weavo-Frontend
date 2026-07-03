/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:   '#080B14',
        violet: { DEFAULT: '#7C3AED', light: '#a78bfa', dark: '#6D28D9' },
        cyan:   { DEFAULT: '#06B6D4', light: '#67e8f9', dark: '#0891b2' },
        glass:  'rgba(255,255,255,0.04)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow:        '0 0 30px rgba(124,58,237,0.4)',
        'glow-cyan': '0 0 30px rgba(6,182,212,0.4)',
        glass:       '0 8px 32px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'gradient-violet-cyan': 'linear-gradient(135deg, #7C3AED, #06B6D4)',
      },
    },
  },
  plugins: [],
};
