// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Base Neutra
          cream: "#F7F4EF",
          sand: "#ffffffff",
          taupe: "#c1b6ceff",

          // Terrosos
          earth: "#8B6A4A",
          deep: "#4A3828",
          leather: "#B08C6A",

          // Roxos Modernos
          lavender: "#e0d4eeff",
          violet: "#A68EC4",
          purple: "#6D4E9E",
          royal: "#4B3572",

          // Texto
          text: "#2A2928",
          softtext: "#5A5957",
        },
      },
    },
  },
  plugins: [],
};
