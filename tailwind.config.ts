import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // DM Sans = functional UI, body text
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        // Instrument Serif = display, hero headings, editorial moments
        heading: ['var(--font-instrument-serif)', 'Georgia', 'serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.6s ease-out forwards',
      },
      colors: {
        parchment: 'var(--color-parchment)',
        stone: {
          DEFAULT: 'var(--color-stone)',
          hover: 'var(--color-stone-hover)',
        },
        ink: 'var(--color-ink)',
        // Primary brand colour — teal replaces evergreen
        teal: {
          DEFAULT: 'var(--color-teal)',
          hover: 'var(--color-teal-hover)',
          soft: 'var(--color-teal-soft)',
          light: 'var(--color-teal-light)',
          dark: 'var(--color-teal-dark)',
        },
        'surface-dark': 'var(--color-surface-dark)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
      },
      container: {
        center: true,
        padding: '2rem',
        screens: {
          '2xl': '1200px',
        },
      },
    },
  },
  plugins: [],
};
export default config;
