/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          dark: '#0a0a0a',
          card: '#141414',
          border: '#2a2a2a',
          accent: '#d4af37', // Gold
          accentHover: '#c19b2e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Prevent breaking the existing frontend vanilla CSS
  }
}
