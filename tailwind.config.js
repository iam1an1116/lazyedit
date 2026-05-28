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
          bg: '#F6F6F4',
          text: '#1A1A1A',
          accent: '#FF4500',
          border: '#EAEAE6',
          muted: '#7A7A75',
          hover: '#F0F0EC',
          deep: '#CDCDC9',
        },
      },
    },
  },
  plugins: [],
}
