import { type Config } from "tailwindcss";
import lineClamp from '@tailwindcss/line-clamp';

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
        heading: ['var(--font-merriweather-sans)', 'sans-serif'],
        fivo: ['"Fivo Sans"', 'sans-serif'],
        baloo: ['"Baloo 2"', 'cursive'],
      },
      colors: {
        primary: "#0077B6",      // Azul Caribe
        secondary: "#FBE9D4",    // Arena clara
        accent: "#FF715B",       // Coral acento
        dark: "#023E8A",         // Azul oscuro
        background: "#FFFFFF",   // Blanco puro
        muted: "#F1F5F9",        // Gris claro
        border: "#E5E7EB",       // Gris para bordes
        ring: "#CBD5E0",         // Anillo de enfoque accesible
      },
      borderColor: {
        border: "#E5E7EB",
      },
      ringColor: {
        ring: "#CBD5E0",
      },
      // Configuraciones adicionales para line-clamp si necesitas más de 6 líneas
      lineClamp: {
        7: '7',
        8: '8',
        9: '9',
        10: '10',
      }
    },
  },
  plugins: [
    // Agrega el plugin de line-clamp usando la variable importada
    lineClamp,
  ],
};

export default config;