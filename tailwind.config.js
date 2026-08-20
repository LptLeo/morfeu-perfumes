/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,scss}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#07090D',
          2: '#10141C',
        },
        parchment: {
          DEFAULT: '#F1F2F5',
          2: '#E4E7ED',
        },
        gold: {
          DEFAULT: '#6C93C7',
          soft: '#AFC6E8',
        },
        wine: {
          DEFAULT: '#A8672E',
          soft: '#BF7E42',
          hover: '#8c561f',
        },
        sand: '#D2D7DF',
        'text-ink': '#171A21',
        'text-cream': '#F3F5F8',
        'text-muted': '#666E7C',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      maxWidth: {
        site: '1180px',
      },
      borderRadius: {
        'brand-s': '6px',
        'brand-m': '14px',
        'brand-l': '28px',
      },
      boxShadow: {
        'brand-1': '0 12px 32px rgba(32, 23, 18, 0.18)',
        'btn-primary': '0 10px 24px rgba(168,103,46,0.35)',
        'btn-gold': '0 10px 24px rgba(108,147,199,0.35)',
        'wa': '0 10px 26px rgba(37,211,102,0.45)',
      },
    },
  },
  plugins: [],
};
