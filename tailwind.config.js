/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#000000',
          surface: '#0A0A0A',
          card: '#111111',
          text: '#FFFFFF',
          accent: '#FF4500',
          border: '#222222',
          muted: '#666666',
          hover: '#1A1A1A',
          deep: '#333333',
        },
        neon: {
          cyan: '#00E5FF',
          magenta: '#FF00E5',
          yellow: '#FFE500',
          green: '#00FF88',
        },
      },
      fontFamily: {
        display: ['"Oswald"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
