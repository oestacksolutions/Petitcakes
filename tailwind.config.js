export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: '#FDFBFA',
        blush: '#F9F2F5',
        roseSoft: '#E56B9F',
        roseHover: '#D4538A',
        cocoa: '#4A3F35',
        cocoaLight: '#7A6E65',
        borderSoft: '#EADCE2'
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
