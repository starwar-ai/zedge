/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ==========================================
      // Color Tokens - Comprehensive Figma Palette
      // ==========================================
      colors: {
        // Special colors
        black: '#000000',
        white: '#ffffff',
        transparent: 'rgba(255, 255, 255, 0)',

        // Semantic Color Tokens (from Figma Tokens collection)
        surface: {
          primary: '#ffffff',     // {color.white}
          secondary: '#f5f5f5',   // {color.neutral.100}
        },
        text: {
          primary: '#314158',     // {color.slate.700}
          secondary: '#a1a1a1',   // {color.neutral.400}
          alert: '#ff6467',       // {color.red.400}
        },
        button: {
          primary: '#262626',     // {color.neutral.800}
          secondary: '#ffffff',   // {color.white}
        },
        tab: {
          active: '#ffffff',      // {color.white}
          inactive: '#d4d4d4',    // {color.neutral.300}
        },
        status: {
          normal: '#bbf451',      // {color.lime.300}
          abnormal: '#ff6467',    // {color.red.400}
          // Legacy status colors (keeping for backward compatibility)
          active: '#22c55e',      // Green - running/active
          creating: '#3b82f6',    // Blue - creating/starting
          error: '#ef4444',       // Red - error state
          warning: '#f59e0b',     // Orange - warning
          deleting: '#f97316',    // Orange-red - deleting
          restarting: '#8b5cf6',  // Purple - restarting
          stopped: '#64748b',     // Slate - stopped
        },
        icon: {
          primary: '#737373',     // {color.neutral.500}
        },
        input: {
          primary: '#ffffff',     // {color.white}
          secondary: '#d4d4d4',   // {color.neutral.300}
        },
        border: {
          default: '#f5f5f5',     // {color.neutral.100}
        },

        // Primitive Color Palette (from Figma Primitives collection)
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cad5e2',
          400: '#90a1b9',
          500: '#62748e',
          600: '#45556c',
          700: '#314158',
          800: '#1d293d',
          900: '#0f172b',
          950: '#020618',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5dc',
          400: '#99a1af',
          500: '#6a7282',
          600: '#4a5565',
          700: '#364153',
          800: '#1e2939',
          900: '#101828',
          950: '#030712',
        },
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#9f9fa9',
          500: '#71717b',
          600: '#52525c',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a1a1a1',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a6a09b',
          500: '#79716b',
          600: '#57534d',
          700: '#44403b',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        red: {
          50: '#fef2f2',
          100: '#ffe2e2',
          200: '#ffc9c9',
          300: '#ffa2a2',
          400: '#ff6467',
          500: '#fb2c36',
          600: '#e7000b',
          700: '#c10007',
          800: '#9f0712',
          900: '#82181a',
          950: '#460809',
        },
        orange: {
          50: '#fff7ed',
          100: '#ffedd4',
          200: '#ffd6a8',
          300: '#ffb86a',
          400: '#ff8904',
          500: '#ff6900',
          600: '#f54a00',
          700: '#ca3500',
          800: '#9f2d00',
          900: '#7e2a0c',
          950: '#441306',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c6',
          200: '#fee685',
          300: '#ffd230',
          400: '#ffba00',
          500: '#fd9a00',
          600: '#e17100',
          700: '#bb4d00',
          800: '#973c00',
          900: '#7b3306',
          950: '#461901',
        },
        yellow: {
          50: '#fefce8',
          100: '#fef9c2',
          200: '#fff085',
          300: '#ffdf20',
          400: '#fcc800',
          500: '#efb100',
          600: '#d08700',
          700: '#a65f00',
          800: '#894b00',
          900: '#733e0a',
          950: '#432004',
        },
        lime: {
          50: '#f7fee7',
          100: '#ecfcca',
          200: '#d8f999',
          300: '#bbf451',
          400: '#9ae600',
          500: '#7ccf00',
          600: '#5ea500',
          700: '#497d00',
          800: '#3d6300',
          900: '#35530e',
          950: '#192e03',
        },
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#b9f8cf',
          300: '#7bf1a8',
          400: '#05df72',
          500: '#00c951',
          600: '#00a63e',
          700: '#008236',
          800: '#016630',
          900: '#0d542b',
          950: '#052e16',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d0fae5',
          200: '#a4f4cf',
          300: '#5ee9b5',
          400: '#00d492',
          500: '#00bc7d',
          600: '#009966',
          700: '#007a55',
          800: '#006045',
          900: '#004f3b',
          950: '#002c22',
        },
        teal: {
          50: '#f0fdfa',
          100: '#cbfbf1',
          200: '#96f7e4',
          300: '#46ecd5',
          400: '#00d5be',
          500: '#00bba7',
          600: '#009689',
          700: '#00786f',
          800: '#005f5a',
          900: '#0b4f4a',
          950: '#022f2e',
        },
        cyan: {
          50: '#ecfeff',
          100: '#cefafe',
          200: '#a2f4fd',
          300: '#53eafd',
          400: '#00d3f2',
          500: '#00b8db',
          600: '#0092b8',
          700: '#007595',
          800: '#005f78',
          900: '#104e64',
          950: '#053345',
        },
        sky: {
          50: '#f0f9ff',
          100: '#dff2fe',
          200: '#b8e6fe',
          300: '#74d4ff',
          400: '#00bcff',
          500: '#00a6f4',
          600: '#0084d1',
          700: '#0069a8',
          800: '#00598a',
          900: '#024a70',
          950: '#052f4a',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bedbff',
          300: '#8ec5ff',
          400: '#51a2ff',
          500: '#2b7fff',
          600: '#155dfc',
          700: '#1447e6',
          800: '#193cb8',
          900: '#1c398e',
          950: '#162456',
        },
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c6d2ff',
          300: '#a3b3ff',
          400: '#7c86ff',
          500: '#615fff',
          600: '#4f39f6',
          700: '#432dd7',
          800: '#372aac',
          900: '#312c85',
          950: '#1e1a4d',
        },
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6ff',
          300: '#c4b4ff',
          400: '#a684ff',
          500: '#8e51ff',
          600: '#7f22fe',
          700: '#7008e7',
          800: '#5d0ec0',
          900: '#4d179a',
          950: '#2f0d68',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d4ff',
          300: '#dab2ff',
          400: '#c27aff',
          500: '#ad46ff',
          600: '#9810fa',
          700: '#8200db',
          800: '#6e11b0',
          900: '#59168b',
          950: '#3c0366',
        },
        fuchsia: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f6cfff',
          300: '#f4a8ff',
          400: '#ed6bff',
          500: '#e12afb',
          600: '#c800de',
          700: '#a800b7',
          800: '#8a0194',
          900: '#721378',
          950: '#4b004f',
        },
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fccee8',
          300: '#fda5d5',
          400: '#fb64b6',
          500: '#f6339a',
          600: '#e60076',
          700: '#c6005c',
          800: '#a3004c',
          900: '#861043',
          950: '#510424',
        },
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#ffccd3',
          300: '#ffa1ad',
          400: '#ff637e',
          500: '#ff2056',
          600: '#ec003f',
          700: '#c70036',
          800: '#a50036',
          900: '#8b0836',
          950: '#4d0218',
        },

        // Legacy semantic colors (keeping for backward compatibility)
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          DEFAULT: '#0ea5e9',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          DEFAULT: '#22c55e',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#f59e0b',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          DEFAULT: '#ef4444',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#3b82f6',
        },
      },

      // ==========================================
      // Typography Tokens
      // ==========================================
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Primitive font sizes (from Figma)
        'xs': ['12px', { lineHeight: '16px' }],      // 12px
        'sm': ['14px', { lineHeight: '20px' }],      // 14px
        'base': ['16px', { lineHeight: '24px' }],    // 16px
        'lg': ['18px', { lineHeight: '28px' }],      // 18px
        'xl': ['20px', { lineHeight: '28px' }],      // 20px
        '2xl': ['24px', { lineHeight: '32px' }],     // 24px
        '3xl': ['30px', { lineHeight: '36px' }],     // 30px
        '4xl': ['36px', { lineHeight: '40px' }],     // 36px
        '5xl': ['48px', { lineHeight: '48px' }],     // 48px
        '6xl': ['60px', { lineHeight: '60px' }],     // 60px
        '7xl': ['72px', { lineHeight: '72px' }],     // 72px
        '8xl': ['96px', { lineHeight: '96px' }],     // 96px
        '9xl': ['128px', { lineHeight: '128px' }],   // 128px

        // Semantic font sizes (from Figma Tokens collection)
        'button-small': ['12px', { lineHeight: '16px' }],      // {font.size.xs}
        'button-medium': ['14px', { lineHeight: '20px' }],     // {font.size.sm}
        'button-large': ['18px', { lineHeight: '28px' }],      // {font.size.lg}
        'heading-h1': ['24px', { lineHeight: '32px' }],        // {font.size.2xl}
        'heading-h2': ['20px', { lineHeight: '28px' }],        // {font.size.xl}
        'heading-h3': ['18px', { lineHeight: '28px' }],        // {font.size.lg}
        'heading-h4': ['14px', { lineHeight: '20px' }],        // {font.size.sm}
        'heading-h5': ['14px', { lineHeight: '20px' }],        // {font.size.sm}
        'input': ['14px', { lineHeight: '20px' }],             // {font.size.sm}
        'label': ['14px', { lineHeight: '20px' }],             // {font.size.sm}
        'table-header': ['14px', { lineHeight: '20px' }],      // {font.size.sm}
        'table-body': ['14px', { lineHeight: '20px' }],        // {font.size.sm}
        'text': ['14px', { lineHeight: '20px' }],              // {font.size.sm}
        'menu-sidebar': ['14px', { lineHeight: '20px' }],      // {font.size.sm}
      },

      // Letter spacing tokens (from Figma)
      letterSpacing: {
        'tighter': '-0.8px',    // {font.tracking.tighter}
        'tight': '-0.4px',      // {font.tracking.tight}
        'normal': '0',          // {font.tracking.normal}
        'wide': '0.4px',        // {font.tracking.wide}
        'wider': '0.8px',       // {font.tracking.wider}
        'widest': '1.6px',      // {font.tracking.widest}
        // Semantic letter spacing
        'button-default': '0',
        'button-tight': '-0.8px',
        'button-loose': '0.8px',
        'text-default': '0',
        'text-tight': '-0.8px',
        'text-loose': '1.6px',
      },

      // ==========================================
      // Spacing & Layout Tokens
      // ==========================================
      spacing: {
        // Primitive spacing scale (from Figma - 4px base unit)
        '0': '0',
        'px': '1px',
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '3.5': '14px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '18': '72px',    // Custom
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
        '36': '144px',
        '40': '160px',
        '44': '176px',
        '48': '192px',
        '52': '208px',
        '56': '224px',
        '60': '240px',
        '64': '256px',
        '72': '288px',
        '80': '320px',
        '88': '352px',   // Custom
        '96': '384px',
        '100': '400px',  // Custom
        '128': '512px',  // Custom

        // Semantic spacing (from Figma Tokens collection)
        'page': '24px',                  // {spacing.6}
        'card': '12px',                  // {spacing.3}
        'form': '8px',                   // {spacing.2}
        'header1': '8px',                // {spacing.2}
        'header2': '8px',                // {spacing.2}
        'input': '8px',                  // {spacing.2}
        'button': '4px',                 // {spacing.1}
        'table': '8px',                  // {spacing.2}
        'input-value': '8px',            // {spacing.2}
        'button-group-tight': '8px',     // {spacing.2}
        'button-group-default': '12px',  // {spacing.3}
      },

      // ==========================================
      // Border Radius Tokens
      // ==========================================
      borderRadius: {
        // Primitive border radius (from Figma)
        'none': '0',
        'xs': '2px',
        'sm': '4px',
        DEFAULT: '6px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
        'full': '9999px',

        // Semantic border radius (from Figma Tokens collection)
        'card': '16px',    // {radius.2xl}
        'input': '4px',    // {radius.sm}
      },

      // ==========================================
      // Border Width Tokens
      // ==========================================
      borderWidth: {
        '0': '0',
        DEFAULT: '1px',
        '2': '2px',
        '4': '4px',
        '8': '8px',
        // Semantic border width
        'default': '1px',   // {border-width.1}
        'divider': '2px',   // {border-width.2}
      },

      // ==========================================
      // Container Sizes (from Figma)
      // ==========================================
      maxWidth: {
        'container-0': '0',
        'container-3xs': '256px',
        'container-2xs': '288px',
        'container-xs': '320px',
        'container-sm': '384px',
        'container-md': '448px',
        'container-lg': '512px',
        'container-xl': '576px',
        'container-2xl': '672px',
        'container-3xl': '768px',
        'container-4xl': '896px',
        'container-5xl': '1024px',
        'container-6xl': '1152px',
        'container-7xl': '1280px',
      },

      // ==========================================
      // Opacity Tokens (from Figma)
      // ==========================================
      opacity: {
        '0': '0',
        '5': '0.05',
        '10': '0.1',
        '15': '0.15',
        '20': '0.2',
        '25': '0.25',
        '30': '0.3',
        '35': '0.35',
        '40': '0.4',
        '45': '0.45',
        '50': '0.5',
        '55': '0.55',
        '60': '0.6',
        '65': '0.65',
        '70': '0.7',
        '75': '0.75',
        '80': '0.8',
        '85': '0.85',
        '90': '0.9',
        '95': '0.95',
        '100': '1',
      },

      // ==========================================
      // Blur Tokens (from Figma)
      // ==========================================
      blur: {
        'none': '0',
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        DEFAULT: '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },

      // ==========================================
      // Skew Tokens (from Figma)
      // ==========================================
      skew: {
        '0': '0deg',
        '1': '1deg',
        '2': '2deg',
        '3': '3deg',
        '6': '6deg',
        '12': '12deg',
      },

      // ==========================================
      // Shadow Tokens
      // ==========================================
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
      },

      // ==========================================
      // Animation Tokens
      // ==========================================
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },

      // ==========================================
      // Z-Index Tokens (Custom application-level)
      // ==========================================
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },

      // ==========================================
      // Transition Tokens
      // ==========================================
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
    },
  },
  plugins: [
    // Add Tailwind plugins here if needed
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
}
