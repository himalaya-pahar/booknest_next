import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        chocolate: '#5c3d2e',
        mahogany: '#8b5e3c',
        amber: '#c4843c',
        gold: '#d4a853',
        parchment: '#f5ecd7',
        cream: '#fdf8f0',
        'warm-white': '#fefcf8',
        ink: '#2a1a10',
        muted: '#7a6050',
        border: 'rgba(92, 61, 46, 0.15)',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Lora', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
      },
      boxShadow: {
        warm: '0 8px 40px rgba(92, 61, 46, 0.18)',
        card: '0 4px 24px rgba(92, 61, 46, 0.12)',
      }
    },
  },
  plugins: [],
};
export default config;