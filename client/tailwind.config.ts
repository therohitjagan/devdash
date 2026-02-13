import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tn: {
          bg: '#1A1B26',
          surface: '#24283B',
          surfaceStrong: '#2F334D',
          text: '#C0CAF5',
          muted: '#7A88CF',
          blue: '#7AA2F7',
          coral: '#FF9E64',
          teal: '#7DCFFF',
          purple: '#BB9AF7',
          border: '#414868',
        },
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['Commit Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        neo: '0 8px 30px rgba(122, 162, 247, 0.18)',
        focus: '0 0 0 2px #1A1B26, 0 0 0 4px #7DCFFF',
      },
      borderRadius: {
        panel: '1.25rem',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.2s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
