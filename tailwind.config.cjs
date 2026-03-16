/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      keyframes: {
        'shimmer-slide': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'slide-up-fade': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'blur-in': {
          '0%': { opacity: '0', filter: 'blur(8px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
        'progress-shrink': {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
        'blob-float': {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-15px, 15px) scale(0.95)' },
          '100%': { transform: 'translate(0, 0) scale(1)' },
        },
        'blob-float-reverse': {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-25px, 15px) scale(0.95)' },
          '66%': { transform: 'translate(20px, -10px) scale(1.08)' },
          '100%': { transform: 'translate(0, 0) scale(1)' },
        },
        'shine-sweep': {
          '0%': { left: '-100%' },
          '100%': { left: '200%' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'gradient-border-spin': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        'shimmer-slide': 'shimmer-slide 2s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 4s ease-in-out infinite',
        'slide-up-fade': 'slide-up-fade 0.5s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.4s ease-out forwards',
        'scale-in': 'scale-in 0.35s ease-out forwards',
        'blur-in': 'blur-in 0.4s ease-out forwards',
        'progress-shrink': 'progress-shrink linear forwards',
        'blob-float': 'blob-float 20s ease-in-out infinite',
        'blob-float-reverse': 'blob-float-reverse 25s ease-in-out infinite',
        'shine-sweep': 'shine-sweep 1.5s ease-in-out',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'gradient-border-spin': 'gradient-border-spin 3s ease infinite',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-soft': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
        'smooth-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      backdropBlur: {
        '3xl': '64px',
        '4xl': '96px',
      },
    },
  },
  plugins: [
    require('daisyui')({
      themes: [
        "light",
        "dark",
        "cupcake",
        "corporate",
        "synthwave",
        "retro",
        "cyberpunk",
        "valentine",
        "halloween",
        "garden",
        "aqua",
        "lofi",
        "pastel",
        "fantasy",
        "wireframe",
        "black",
        "luxury",
        "dracula",
        "cmyk",
        "autumn",
        "business",
        "acid",
        "lemonade",
        "night",
        "coffee",
        "winter",
        "dim",
        "nord",
        "sunset",
      ],
      logs: false,
    }),
  ],
};
