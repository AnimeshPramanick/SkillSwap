/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Color System based on Design Specification
      colors: {
        primary: {
          50: '#EBF4FF',
          100: '#D6E8FF',
          500: '#007AFF',
          700: '#0059B8',
          900: '#003B7A'
        },
        neutral: {
          0: '#FFFFFF',
          50: '#F8F9FA',
          400: '#6C757D',
          700: '#343A40',
          900: '#212529'
        },
        success: '#28A745',
        warning: '#FFC107',
        error: '#DC3545'
      },
      
      // Typography System - Inter Font Family
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'monospace']
      },
      
      // Spacing System - 4px Base Grid
      spacing: {
        'xs': '8px',   // space-xs
        'sm': '12px',  // space-sm
        'md': '16px',  // space-md
        'lg': '24px',  // space-lg
        'xl': '32px',  // space-xl
        'xxl': '48px', // space-xxl
        'xxxl': '64px' // space-xxxl
      },
      
      // Typography Scale - Major Third (1.25)
      fontSize: {
        'xs': ['12px', '16px'],        // 0.75rem, 1rem
        'sm': ['14px', '20px'],        // 0.875rem, 1.25rem - Label
        'base': ['16px', '26px'],      // 1rem, 1.625rem - Body
        'lg': ['18px', '28px'],        // 1.125rem, 1.75rem
        'xl': ['20px', '30px'],        // 1.25rem, 1.875rem
        '2xl': ['24px', '34px'],       // 1.5rem, 2.125rem - H3
        '3xl': ['32px', '42px'],       // 2rem, 2.625rem - H2
        '4xl': ['48px', '58px'],       // 3rem, 3.625rem - H1
      },
      
      // Border Radius
      borderRadius: {
        'sm': '8px',   // radius-sm
        'md': '12px',  // radius-md
        'lg': '16px',  // radius-lg
        'xl': '24px'   // radius-xl
      },
      
      // Shadows - Subtle & Layered
      boxShadow: {
        'sm': '0 2px 4px rgba(0, 0, 0, 0.04)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'lg': '0 10px 30px rgba(0, 0, 0, 0.12)',
        'xl': '0 20px 40px rgba(0, 0, 0, 0.16)',
        'primary': '0 0 0 3px rgba(0, 122, 255, 0.2)'
      },
      
      // Animations & Transitions
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.8, 0.25, 1)',
        'spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms'
      },
      
      // Layout Max Width
      maxWidth: {
        'container': '1280px',
        'container-sm': '768px',
        'container-lg': '1024px'
      },
      
      // Breakpoints
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px'
      },
      
      // Z-Index Scale
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080'
      },
      
      // Background Patterns
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #007AFF 0%, #0059B8 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
        'pattern-dots': 'radial-gradient(circle, #6C757D 1px, transparent 1px)',
        'pattern-grid': 'linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px)'
      },
      
      // Custom Utilities
      utilities: {
        'text-gradient': {
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent'
        },
        'scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        'scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#F8F9FA'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#6C757D',
            borderRadius: '3px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#343A40'
          }
        }
      }
    },
  },
  plugins: [
    // Custom plugin for SkillSwap utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Custom focus styles
        '.focus-ring': {
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(0, 122, 255, 0.2)'
          }
        },
        
        // Custom hover animations
        '.hover-lift': {
          transition: 'all 300ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)'
          }
        },
        
        // Skill tag styles
        '.skill-tag': {
          backgroundColor: theme('colors.primary.50'),
          color: theme('colors.primary.900'),
          borderRadius: theme('borderRadius.sm'),
          paddingTop: theme('spacing.xs'),
          paddingBottom: theme('spacing.xs'),
          paddingLeft: theme('spacing.sm'),
          paddingRight: theme('spacing.sm'),
          fontSize: theme('fontSize.sm[0]'),
          lineHeight: theme('fontSize.sm[1]'),
          fontWeight: theme('fontWeight.medium'),
          display: 'inline-block'
        },
        
        // Online status indicator
        '.status-online': {
          backgroundColor: theme('colors.success'),
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          border: '2px solid ' + theme('colors.neutral.0')
        },
        
        // Card hover effects
        '.card-hover': {
          transition: 'all 300ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          '&:hover': {
            transform: 'translateY(-2px) scale(1.02)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)'
          }
        },
        
        // Button variants
        '.btn-primary': {
          backgroundColor: theme('colors.primary.500'),
          color: theme('colors.neutral.0'),
          borderRadius: theme('borderRadius.sm'),
          paddingTop: theme('spacing.md'),
          paddingBottom: theme('spacing.md'),
          paddingLeft: theme('spacing.lg'),
          paddingRight: theme('spacing.lg'),
          fontSize: theme('fontSize.base[0]'),
          lineHeight: theme('fontSize.base[1]'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 200ms ease-out',
          '&:hover': {
            backgroundColor: theme('colors.primary.700'),
            transform: 'translateY(-2px)'
          },
          '&:active': {
            transform: 'translateY(0px) scale(0.98)'
          }
        },
        
        // Form input styles
        '.input-field': {
          backgroundColor: theme('colors.neutral.0'),
          border: `1px solid ${theme('colors.neutral.50')}`,
          borderRadius: theme('borderRadius.sm'),
          paddingTop: theme('spacing.md'),
          paddingBottom: theme('spacing.md'),
          paddingLeft: theme('spacing.md'),
          paddingRight: theme('spacing.md'),
          fontSize: theme('fontSize.base[0]'),
          lineHeight: theme('fontSize.base[1]'),
          color: theme('colors.neutral.700'),
          transition: 'border-color 200ms ease-out, box-shadow 200ms ease-out',
          '&::placeholder': {
            color: theme('colors.neutral.400')
          },
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.primary.500'),
            boxShadow: '0 0 0 3px rgba(0, 122, 255, 0.2)'
          }
        }
      };
      
      addUtilities(newUtilities);
    }
  ],
  // Enable dark mode support (for future enhancement)
  darkMode: 'class',
}