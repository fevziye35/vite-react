/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Bitrix24 Style Palette
                background: '#f5f7f8',
                surface: '#ffffff',
                border: '#eef2f4',

                // Typography
                primary: '#333333',
                secondary: '#525c69',
                muted: '#959ca4',

                // Brand Colors
                accent: {
                    DEFAULT: '#2fc6f6', // Bitrix Light Blue
                    hover: '#29b0db',
                    50: '#f0fbfe',
                    100: '#e1f7fd',
                    500: '#2fc6f6',
                    600: '#29b0db',
                    700: '#218fb2',
                },
                danger: {
                    DEFAULT: '#af52de', // Changed from red to purple
                    hover: '#9a45c6',
                },
                success: {
                    DEFAULT: '#7bd500', 
                },
                warning: {
                    DEFAULT: '#ffc600',
                },
                info: {
                    DEFAULT: '#2067b0', // Darker Bitrix Blue
                },
                purple: {
                    DEFAULT: '#af52de',
                    hover: '#9a45c6',
                },

                // UI Elements
                sidebar: '#1c2a3e', // Dark Sidebar option
            },
            fontFamily: {
                sans: ['Open Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'DEFAULT': '0 2px 4px rgba(0,0,0,.04)',
                'lg': '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                'card': '0 1px 2px rgba(0,0,0,.1)',
            },
            borderRadius: {
                'sm': '2px',
                'md': '4px',
                'lg': '6px',
                'xl': '8px',
                '2xl': '12px',
            },
            backdropBlur: {
                'xs': '2px',
            }
        },
    },
    plugins: [],
}
