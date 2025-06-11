// tailwind.config.ts
import lineClamp from '@tailwindcss/line-clamp'

const config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: ['bg-white'], // ahora TypeScript no lo valida contra UserConfig
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        heading: ['"Merriweather Sans"', 'sans-serif'],
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
      lineClamp: {
        7: '7',
        8: '8',
        9: '9',
        10: '10',
      },
    },
  },
  plugins: [lineClamp],
}

export default config
