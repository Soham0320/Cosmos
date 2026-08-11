/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#060911',
        panel: 'rgba(12, 16, 29, 0.6)',
        'panel-border': 'rgba(255, 255, 255, 0.08)',
        primary: '#00e5ff',
        secondary: '#b388ff'
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(to bottom right, #060911, #0c101d, #060911)',
      }
    },
  },
  plugins: [],
}
