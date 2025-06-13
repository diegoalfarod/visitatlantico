/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: ['bg-white', 'text-foreground', 'bg-background'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
        heading: ['var(--font-merriweather-sans)', 'sans-serif'],
        fivo: ['"Fivo Sans"', 'sans-serif'],
        baloo: ['"Baloo 2"', 'cursive'],
      },
      colors: {
        primary: '#0077B6',
        secondary: '#FBE9D4',
        accent: '#FF715B',
        dark: '#023E8A',
        background: '#FFFFFF',
        muted: '#F1F5F9',
        border: '#E5E7EB',
        ring: '#CBD5E0',
      },
      borderColor: {
        border: '#E5E7EB',
      },
      ringColor: {
        ring: '#CBD5E0',
      },
    },
  },
  plugins: [],
}
