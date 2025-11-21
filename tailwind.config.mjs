/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      keyframes: {
        gradientMove: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        markDiagonal: {
          '0%': { transform: 'translateX(-120%) rotate(0deg)' }, // start off-screen left
          '50%': { transform: 'translateX(50%) rotate(180deg)' }, // middle
          '100%': { transform: 'translateX(120%) rotate(360deg)' }, // exit off-screen right
        },
      },
      animation: {
        'gradient-move': 'gradientMove 8s ease infinite',
        'mark-diagonal': 'markDiagonal 5s linear infinite',
      },
    },
  },
  plugins: [],
}
