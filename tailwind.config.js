/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ant: {
          bg:        '#f5f4ef',
          surface:   '#faf9f7',
          border:    '#e5e1d8',
          muted:     '#9e8f7d',
          primary:   '#d97757',
          'primary-dark': '#c8673f',
          'primary-light': '#fdf0eb',
          'primary-border': '#f0cfc0',
          text:      '#1a1a1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
