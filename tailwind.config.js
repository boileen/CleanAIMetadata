/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Clean Palette: White background, Dark Navy headlines, Royal Blue actions, Cyan accents
        canvas: '#FFFFFF',            // Pure white background
        card: '#FFFFFF',              // Pure white containers
        'card-raised': '#F8FAFC',     // Slightly raised soft card / dropzone inner (Slate-50)
        'card-strong': '#F1F5F9',     // Active nav tab pill & hover background (Slate-100)
        subtle: '#E2E8F0',            // 1px crisp subtle border (Slate-200)
        'subtle-hover': '#CBD5E1',    // Active input / hover border (Slate-300)
        foreground: '#081736',        // Deep dark navy heading & primary text
        muted: '#5B6779',             // Secondary subtitle & helper text
        'muted-strong': '#33415C',    // Strong labels & descriptions
        brand: {
          DEFAULT: '#2563EB',         // Royal Blue for buttons, links, important actions
          hover: '#1D4ED8',           // Darker royal blue hover
          soft: '#EFF6FF',            // Soft blue tint for upload icon box & active sub-badges
          cyan: '#06B6D4',            // Cyan for small highlight and visual effects
          coral: '#06B6D4',           // Backward-compatible alias for cyan
          foreground: '#FFFFFF',      // Text on primary buttons
        },
        cyan: {
          DEFAULT: '#06B6D4',         // Cyan highlight
          hover: '#0891B2',
          soft: '#ECFEFF',
        },
        navy: {
          DEFAULT: '#081736',         // Dark navy for headlines, navigation, and footer
          surface: '#0D2047',
          border: '#162C5B',
        },
        risk: {
          rose: {
            text: '#DC2626',
            bg: '#FEF2F2',
            border: '#FECACA',
          },
          amber: {
            text: '#D97706',
            bg: '#FFFBEB',
            border: '#FDE68A',
          },
          emerald: {
            text: '#16A34A',
            bg: '#F0FDF4',
            border: '#BBF7D0',
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
        'unheic': '0 20px 60px rgba(8, 23, 54, 0.08)',
        'subtle': '0 1px 3px 0 rgba(8, 23, 54, 0.04), 0 1px 2px -1px rgba(8, 23, 54, 0.04)',
      }
    },
  },
  plugins: [],
}
