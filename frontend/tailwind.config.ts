import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                ramadan: {
                    // Deep blues and purples for night sky
                    dark: "#0a0e27",
                    navy: "#1a1f3a",
                    blue: "#2d3561",
                    purple: "#4a3b6e",
                    // Gold accents
                    gold: "#d4af37",
                    "gold-light": "#f4d03f",
                    // Accent colors
                    teal: "#1dd3b0",
                    pink: "#ff6b9d",
                },
            },
            backgroundImage: {
                "ramadan-gradient": "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2d3561 100%)",
                "gold-gradient": "linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)",
                "card-gradient": "linear-gradient(135deg, rgba(42, 47, 97, 0.6) 0%, rgba(74, 59, 110, 0.4) 100%)",
            },
            boxShadow: {
                "glow": "0 0 20px rgba(212, 175, 55, 0.3)",
                "glow-strong": "0 0 30px rgba(212, 175, 55, 0.5)",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-in",
                "slide-up": "slideUp 0.5s ease-out",
                "pulse-glow": "pulseGlow 2s ease-in-out infinite",
                "twinkle": "twinkle 3s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                pulseGlow: {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)" },
                    "50%": { boxShadow: "0 0 30px rgba(212, 175, 55, 0.6)" },
                },
                twinkle: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.3" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
