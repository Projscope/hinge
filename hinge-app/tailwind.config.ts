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
        // Dark app palette
        bg: {
          DEFAULT: '#0e0d0b',
          2: '#161510',
          3: '#1e1c18',
          4: '#252320',
        },
        ink: {
          DEFAULT: '#f5f2ec',
          2: '#c8c4b8',
          3: '#7a7670',
          4: '#3a3830',
        },
        // Light / cream palette (landing page)
        cream: '#faf8f4',
        surface: '#0f0e0c',
        // Accent
        gold: {
          DEFAULT: '#c8922a',
          light: '#f5e4c0',
          dark: '#8a6118',
          faint: '#faf0dc',
          dim: 'rgba(200,146,42,0.15)',
        },
        teal: {
          DEFAULT: '#1a7a65',
          bright: '#22a085',
          light: '#d4f0ea',
        },
        danger: {
          DEFAULT: '#c0392b',
          dim: 'rgba(192,57,43,0.15)',
        },
        amber: '#d97706',
      },
      fontFamily: {
        serif: ['var(--font-dm-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      borderColor: {
        subtle: 'rgba(245,242,236,0.07)',
        DEFAULT: 'rgba(245,242,236,0.12)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateX(-50%) translateY(12px)' },
          to: { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
        },
        toastOut: {
          to: { opacity: '0' },
        },
        confetti: {
          '0%': { opacity: '1', transform: 'translateY(0) rotate(0deg)' },
          '100%': { opacity: '0', transform: 'translateY(90px) rotate(720deg)' },
        },
      },
      gridTemplateColumns: {
        app: '220px 1fr 290px',
      },
      animation: {
        fadeUp: 'fadeUp 0.2s ease forwards',
        toastIn: 'toastIn 0.22s ease forwards',
        toastOut: 'toastOut 0.25s ease forwards',
        confetti: 'confetti 1s ease forwards',
      },
    },
  },
  plugins: [],
}

export default config
