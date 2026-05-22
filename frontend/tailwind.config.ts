const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Color Palette
      colors: {
        navy:   '#050d1a',  // Page background — deepest base
        deep:   '#0a1628',  // Card/widget background
        mid:    '#0f2244',  // Elevated surfaces, nav
        blue:   '#1a3a6e',  // Borders, secondary surfaces
        bright: '#1e5eff',  // Primary accent, glows, dividers
        sky:    '#38b4ff',  // Nav links, labels, secondary text
        cyan:   '#00e5ff',  // Headlines, highlights, logo glow
        glow:   '#4df0ff',  // Hover states, sparkles
        pink:   '#ff6eb4',  // Anime tag, accent pop, diary mood
        yellow: '#ffe566',  // Stars, ratings, site badge
        mint:   '#5fffc8',  // Gaming tag, progress, status dot
        white:  '#e8f4ff',  // Body text
      },

      // Grid layouts
      gridTemplateColumns: {
        hero: '3fr 2fr', // HeroSection: intro left (60%), ProfileCard right (40%)
      },

      // Font
      fontFamily: {
        pixel:    ['var(--font-press-start)', 'monospace'],
        terminal: ['var(--font-vt323)', 'monospace'],
        body:     ['var(--font-nunito)', 'sans-serif'],
      },
    },
  },
}

export default config