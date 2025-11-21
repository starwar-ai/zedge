/** @type {import('tailwindcss').Config} */

// 尝试读取自动生成的 Figma tokens JSON（如果存在）
// 注意：如果文件不存在，会使用默认配置
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const tokensJsonPath = join(__dirname, 'tailwind.config.tokens.json');

let figmaTokensExtend = {};
try {
  if (existsSync(tokensJsonPath)) {
    const tokensJson = JSON.parse(readFileSync(tokensJsonPath, 'utf-8'));
    // 转换为 Tailwind extend 格式
    figmaTokensExtend = {
      colors: tokensJson.colors || {},
      spacing: tokensJson.spacing || {},
      fontSize: tokensJson.fontSize || {},
      borderRadius: tokensJson.borderRadius || {},
      boxShadow: tokensJson.boxShadow || {},
    };
  }
} catch (e) {
  // 如果读取失败，使用默认配置
  // 这是正常的，如果还没有运行过同步脚本
  figmaTokensExtend = {};
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 合并 Figma tokens（如果存在，优先级更高）
      ...figmaTokensExtend,
      
      // Color tokens - Zedge Cloud Platform
      colors: {
        // Primary brand colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',  // Main primary
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          DEFAULT: '#0ea5e9',
        },

        // Semantic colors
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

        // Status colors (for instances, resources)
        status: {
          active: '#22c55e',      // Green - running/active
          inactive: '#94a3b8',    // Gray - stopped/inactive
          creating: '#3b82f6',    // Blue - creating/starting
          error: '#ef4444',       // Red - error state
          warning: '#f59e0b',     // Orange - warning
          deleting: '#f97316',    // Orange-red - deleting
          restarting: '#8b5cf6',  // Purple - restarting
          stopped: '#64748b',     // Slate - stopped
        },

        // Neutral/Gray scale (Slate from Figma)
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },

        // Slate colors from Figma (matching tokens.json)
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

        // Red colors from Figma
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

        // Lime colors from Figma
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

        // Semantic color tokens from DESIGN_TOKENS.md
        surface: {
          primary: '#ffffff',      // white
          secondary: '#f8fafc',    // slate-50
        },
        text: {
          primary: '#314158',      // slate-700
          secondary: '#90a1b9',    // slate-400
          alert: '#ff6467',        // red-400
        },
        button: {
          primary: '#1d293d',      // slate-800
          secondary: '#ffffff',   // white
        },
        tab: {
          active: '#ffffff',       // white
          inactive: '#62748e',    // slate-500
        },
        status: {
          normal: '#bbf451',       // lime-300
          abnormal: '#ff6467',     // red-400
        },
        icon: {
          primary: '#62748e',     // slate-500
        },
        input: {
          primary: '#ffffff',      // white
          secondary: '#cad5e2',   // slate-300
        },
        border: {
          default: '#f1f5f9',     // slate-100
        },
      },

      // Typography tokens
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
        
        // Semantic font size tokens from DESIGN_TOKENS.md
        'button-small': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'button-medium': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'button-large': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'heading-h1': ['1.5rem', { lineHeight: '2rem' }],         // 24px
        'heading-h2': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
        'heading-h3': ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
        'heading-h4': ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
        'heading-h5': ['0.875rem', { lineHeight: '1.25rem' }],     // 14px
        'input': ['0.875rem', { lineHeight: '1.25rem' }],         // 14px
        'label': ['0.875rem', { lineHeight: '1.25rem' }],        // 14px
        'table-header': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'table-body': ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
        'text': ['0.875rem', { lineHeight: '1.25rem' }],         // 14px
        'menu-sidebar': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
      },
      
      // Letter spacing tokens
      letterSpacing: {
        'button-default': '0',
        'button-tight': '-0.8px',
        'button-loose': '0.8px',
        'text-default': '0',
        'text-tight': '-0.8px',
        'text-loose': '1.6px',
      },

      // Spacing tokens (extends default Tailwind spacing)
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '100': '25rem',   // 400px
        '128': '32rem',   // 512px
        
        // Semantic spacing tokens from DESIGN_TOKENS.md
        'page': '24px',              // p-page
        'card': '12px',              // p-card
        'form': '8px',               // p-form
        'header1': '8px',            // p-header1
        'header2': '8px',            // p-header2
        'input': '8px',              // p-input
        'button': '4px',             // p-button
        'table': '8px',              // p-table
        'input-value': '8px',        // spacing.input-value
        'button-group-tight': '8px', // gap-button-group-tight
        'button-group-default': '12px', // gap-button-group-default
      },

      // Border radius tokens
      borderRadius: {
        'none': '0',
        'xs': '2px',
        'sm': '0.25rem',   // 4px
        DEFAULT: '0.25rem', // 4px
        'md': '0.375rem',   // 6px
        'lg': '0.5rem',     // 8px
        'xl': '0.75rem',    // 12px
        '2xl': '1rem',      // 16px
        '3xl': '1.5rem',    // 24px
        '4xl': '2rem',      // 32px
        'full': '9999px',
        
        // Semantic border radius tokens from DESIGN_TOKENS.md
        'card': '16px',     // rounded-card
        'input': '4px',     // rounded-input
      },
      
      // Border width tokens
      borderWidth: {
        'default': '1px',   // border-default
        'divider': '2px',   // border-divider
      },

      // Shadow tokens
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

      // Animation tokens
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },

      // Breakpoints (Tailwind default, documented here for reference)
      // sm: 640px
      // md: 768px
      // lg: 1024px
      // xl: 1280px
      // 2xl: 1536px

      // Z-index tokens
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },

      // Transition tokens
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
