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
        safe: '#00f5a0',
        warning: '#fbbf24',
        danger: '#ff4d6d',
        darkBg: '#0a0f1e',
        cardBg: '#111827',
        borderMuted: 'rgba(255,255,255,0.08)',
        textPrimary: '#ffffff',
        textSecondary: '#9ca3af',
        textTertiary: '#4b5563',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
      boxShadow: {
        glowSafe: '0 0 15px rgba(0, 245, 160, 0.25)',
        glowDanger: '0 0 15px rgba(255, 77, 109, 0.25)',
        glowWarning: '0 0 15px rgba(251, 191, 36, 0.25)',
      }
    },
  },
  plugins: [],
}
