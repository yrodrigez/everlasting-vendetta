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
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            colors: {
                ocean: '#1D4851',
                wood: '#423B35',
                stone: '#797467',
                moss: '#3E5C4F',
                sky: '#A2B5BB',
                ivory: '#DBD2C3',
                gold: '#C9A866',
                primary: "#dbd2c3",
                legendary: "#FF8000",
                epic: "#A335EE",
                rare: "#0070f3",
                uncommon: "#00FF00",
                common: "#FFFFFF",
                battlenet: "#00AEFF",
            },
        },
    },
    darkMode: "class",
    plugins: [nextui()],
};
export default config;
