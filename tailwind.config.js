/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact Unheic.io Color Palette extracted from Screenshot(1).png
        canvas: '#F4F7F3',            // Soft sage/mint off-white background
        card: '#FFFFFF',              // Pure white containers
        'card-raised': '#F9FBF8',     // Slightly raised soft card / dropzone inner
        'card-strong': '#EAEFEB',     // Active nav tab pill & hover background
        subtle: '#D5E0DA',            // 1px crisp subtle border (--line)
        'subtle-hover': '#AEBFB6',    // Active input / hover border (--line-strong)
        foreground: '#10201C',        // Deep near-black heading text
        muted: '#5A6B65',             // Secondary subtitle & helper text
        'muted-strong': '#344A43',    // Strong labels & descriptions
        brand: {
          DEFAULT: '#0B4234',         // Signature Unheic Dark Evergreen
          hover: '#073328',           // Darker evergreen hover
          soft: '#DFF4EC',            // Soft mint for upload icon box & active sub-badges
          coral: '#FF6B4A',           // Unheic logo coral micro-dot
          foreground: '#FFFFFF',      // Text on primary buttons
        },
        risk: {
          rose: {
            text: '#B42318',
            bg: '#FEE4E2',
            border: '#FECDCA',
          },
          amber: {
            text: '#B34423',
            bg: '#FFEADF',
            border: '#FECDBA',
          },
          emerald: {
            text: '#087443',
            bg: '#DCFAE6',
            border: '#ABF5CE',
          }
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'panel': '1.35rem',
        'panel-raised': '1.65rem',
        'btn': '0.75rem',
      },
      boxShadow: {
        'unheic': '0 20px 60px rgba(11, 66, 52, 0.08)',
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
