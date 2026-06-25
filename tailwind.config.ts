import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Premium homepage design system ──────────────────────────
        canvas:  '#0A0E14',
        panel: {
          DEFAULT: '#111820',
          raised:  '#161E28',
        },
        wire: {
          DEFAULT: '#1E2A38',
          bright:  '#2D3F52',
        },
        mint: {
          DEFAULT: '#00D9A6',
          50:  '#E6FBF5',
          100: '#B3F4E3',
          200: '#66E9C7',
          300: '#33E0B5',
          400: '#00D9A6',
          500: '#00B88E',
          600: '#009B77',
          700: '#007A5E',
        },
        fire: {
          DEFAULT: '#FF4D00',
          50:  '#FFF0E6',
          400: '#FF6B2B',
          500: '#FF4D00',
          600: '#E64400',
          700: '#CC3C00',
        },
        ink: {
          DEFAULT: '#F0F4F8',
          muted:   '#6B7A8D',
          subtle:  '#3D4A5C',
          faint:   '#1E2A38',
        },
        // ── Legacy tokens — keep for admin / dashboard ───────────────
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        surface: {
          DEFAULT: '#0f0f0f',
          card:    '#1a1a1a',
          border:  '#2a2a2a',
          muted:   '#3a3a3a',
        },
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'radar-sweep': 'radarSweep 10s linear infinite',
        'fade-up':     'fadeUp 0.7s ease-out both',
        'fade-in':     'fadeIn 0.5s ease-out both',
      },
      keyframes: {
        radarSweep: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      transitionDelay: {
        '150': '150ms',
        '300': '300ms',
        '450': '450ms',
      },
    },
  },
  plugins: [],
}

export default config
