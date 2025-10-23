/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'eco': {
          'cape-cod': '#383939',
          'mountain-meadow': '#159e69',
          'emerald': '#37c856',
          'pear': '#afe637',
          'scotch-mist': '#fffedb',
          // Variaciones adicionales para mejor UX
          'cape-cod-light': '#4a4a4a',
          'cape-cod-dark': '#2a2a2a',
          'mountain-meadow-light': '#1fb876',
          'mountain-meadow-dark': '#0f7a4f',
          'emerald-light': '#4ddb6a',
          'emerald-dark': '#2bb042',
          'pear-light': '#c2f04a',
          'pear-dark': '#9bc92a',
          'scotch-mist-dark': '#f0f0c7',
        },
        // Variables de tema
        'theme': {
          'primary': 'var(--bg-primary)',
          'secondary': 'var(--bg-secondary)',
          'tertiary': 'var(--bg-tertiary)',
          'text-primary': 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          'text-tertiary': 'var(--text-tertiary)',
          'border-primary': 'var(--border-primary)',
          'border-secondary': 'var(--border-secondary)',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'pattern-float': 'patternFloat 25s ease-in-out infinite',
        'pattern-move': 'patternMove 30s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.8s ease-out forwards',
        'slide-in-right': 'slideInRight 0.8s ease-out forwards',
        "slideIn": 'slideIn 0.3s ease',
        'fadeIn': 'fadeIn 0.2s ease',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(30px, -30px) rotate(1deg)' },
          '66%': { transform: 'translate(-20px, 20px) rotate(-1deg)' },
        },
        patternFloat: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(-20px, -30px) rotate(1deg)' },
          '66%': { transform: 'translate(20px, -20px) rotate(-1deg)' },
        },
        patternMove: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-20px, -20px)' },
        },
        fadeInUp: {
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          }
        },
        slideInLeft: {
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          }
        },
        slideInRight: {
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          }
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        }
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'strong': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}