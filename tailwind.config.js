/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'gradient-x': 'gradient-x 15s ease infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 8s ease-in-out infinite 2s',
                'float-slow': 'float 10s ease-in-out infinite',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'shimmer-fast': 'shimmer 1.5s linear infinite',
                'spin-slow': 'spin 20s linear infinite',
                'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
                'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
                'scale-in': 'scale-in 0.5s ease-out forwards',
                'border-flow': 'border-flow 3s linear infinite',
            },
            keyframes: {
                'gradient-x': {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center'
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center'
                    },
                },
                'shimmer': {
                    'from': {
                        'background-position': '0 0'
                    },
                    'to': {
                        'background-position': '-200% 0'
                    }
                },
                'float': {
                    '0%, 100%': {
                        transform: 'translateY(0px) rotate(0deg)',
                    },
                    '50%': {
                        transform: 'translateY(-20px) rotate(5deg)',
                    },
                },
                'glow-pulse': {
                    '0%, 100%': {
                        opacity: '1',
                        filter: 'blur(20px)',
                    },
                    '50%': {
                        opacity: '0.6',
                        filter: 'blur(30px)',
                    },
                },
                'bounce-gentle': {
                    '0%, 100%': {
                        transform: 'translateY(0)',
                    },
                    '50%': {
                        transform: 'translateY(-5px)',
                    },
                },
                'fade-in-up': {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(20px)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)',
                    },
                },
                'scale-in': {
                    '0%': {
                        opacity: '0',
                        transform: 'scale(0.9)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'scale(1)',
                    },
                },
                'border-flow': {
                    '0%': {
                        'background-position': '0% 50%',
                    },
                    '50%': {
                        'background-position': '100% 50%',
                    },
                    '100%': {
                        'background-position': '0% 50%',
                    },
                },
            }
        },
    },
    plugins: [],
};
