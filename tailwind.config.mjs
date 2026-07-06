/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md}'],
  theme: {
    extend: {
      colors: {
        // "Neon Garage" — jet black + pure white + electric blue accent.
        accent: '#00A8FF', // electric blue: CTAs, icons, highlights
        accentDk: '#0086D6', // pressed / hover blue
        ink: '#111111', // jet black backgrounds
        coal: '#1A1A1A', // elevated dark surface
        line: '#2A2A2A', // borders / hairlines on dark
        smoke: '#A3A3A3', // muted text on dark
        paper: '#FFFFFF', // pure white
        mint: '#F0F7FD', // testimonial card surface (pale blue tint)
        whisper: '#F9F9F9', // input / light card surface
        sand: '#EEEEEE', // hairline borders on light
        ash: '#888888', // muted text on light (dates, placeholders)
        char: '#333333', // body text on light
      },
      fontFamily: {
        // Industrial condensed uppercase for headings; clean sans for body;
        // handwritten script for section eyebrows.
        display: ['"Special Gothic Expanded One"', 'Impact', 'sans-serif'],
        body: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        script: ['"Sedgwick Ave"', 'cursive'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
  plugins: [],
};
