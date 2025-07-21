// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        'neutral-light': '#F9F9F9',
        'neutral-dark':  '#2E2E2E',
        'accent-orange':'#FF8A00',
        // add your primary gradients here if you like
      }
    }
  },
  plugins: []
}