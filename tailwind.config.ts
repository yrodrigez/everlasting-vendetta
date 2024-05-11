import type {Config} from "tailwindcss";
import {nextui} from '@nextui-org/react';

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            dropShadow: {
                glow: '0 4px 6px -1px rgba(201, 168, 102, 0.1), 0 2px 4px -2px rgba(201, 168, 102, 0.1)',
                sunrays: '0 0 10px #c9a866, 0 0 20px #c9a866, 0 0 40px #c9a866, 0 0 60px #c9a866',
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            colors: {
                primary: "#dbd2c3",
                dark: '#031111',
                ['dark-100']: '#1d383b',
                ocean: '#1D4851',
                wood: '#423B35',
                ['wood-100']: '#5f5a53',
                stone: '#797467',
                ['stone-100']: '#afad9a',
                moss: '#3E5C4F',
                sky: '#A2B5BB',
                ivory: '#DBD2C3',
                gold: '#C9A866',
                legendary: "#FF8000",
                epic: "#A335EE",
                rare: "#0070f3",
                uncommon: "#00FF00",
                common: "#FFFFFF",
                relic: "#e5cc80",
                pink: "#e268a8",
                battlenet: "#0074e0",
            },
        },
    },
    darkMode: "class",
    plugins: [nextui()],
};
export default config;
