/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Apple-style Neutral Palette
                background: '#F5F5F7', // Main app background
                surface: '#FFFFFF', // Cards, Sidebar, Header
                border: '#E5E5E5', // Subtle borders

                // Typography
                primary: '#1D1D1F', // Main text
                secondary: '#86868B', // Secondary text

                // Brand Colors
                accent: {
                    DEFAULT: '#007AFF', // Apple Blue
                    hover: '#0066CC',
                    50: '#F0F7FF',
                    100: '#E0EEFF',
                    500: '#007AFF',
                    600: '#0066CC',
                    700: '#0055AA',
                },
                danger: {
                    DEFAULT: '#FF3B30', // Apple Red
                    hover: '#D63026',
                },
                success: {
                    DEFAULT: '#34C759', // Apple Green
                },
                warning: {
                    DEFAULT: '#FF9500', // Apple Orange
                },

                // Glass Tokens
                glass: {
                    DEFAULT: 'rgba(255, 255, 255, 0.72)',
                    border: 'rgba(255, 255, 255, 0.5)',
                }
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'DEFAULT': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
                'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
                'floating': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                'glow': '0 0 0 4px rgba(0, 122, 255, 0.15)', // Blue focus ring
            },
            borderRadius: {
                'xl': '12px',
                '2xl': '16px',
                '3xl': '24px',
                '4xl': '32px',
            },
            backdropBlur: {
                'xs': '2px',
            }
        },
    },
    plugins: [],
}
