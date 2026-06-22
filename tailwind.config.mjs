/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md}'],
  theme: {
    extend: {
      colors: {
        // Paleta del prototipo 1 — crema / oliva / terracota.
        // `cafe` y `terraInk` ajustados para cumplir WCAG AA sobre crema.
        crema: '#F5EFE3',
        arena: '#EAE0CC',
        oliva: '#9A9456',
        olivaDk: '#6E6A3C',
        salvia: '#B9BC8F',
        terra: '#E9A48E',
        terraInk: '#B05A3C', // versión texto del terra (≥3:1 sobre crema)
        blush: '#F0B9A6',
        tinta: '#332E25',
        cafe: '#6B5C45', // cuerpo de texto (≥4.5:1 sobre crema)
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        body: ['"Karla Variable"', 'Karla', 'sans-serif'],
        script: ['"Homemade Apple"', 'cursive'],
      },
      transitionTimingFunction: {
        // ease-out fuerte para entradas y hovers (emil-design-eng)
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
  plugins: [],
};
