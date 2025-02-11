import type {Config} from "tailwindcss";
import {heroui} from "@heroui/react";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
        'left-3',
        'left-6',
        'hover:bg-warrior',
        'hover:bg-paladin',
        'hover:bg-hunter',
        'hover:bg-rogue',
        'hover:bg-priest',
        'hover:bg-shaman',
        'hover:bg-mage',
        'hover:bg-warlock',
        'hover:bg-druid',
        'hover:shadow-warrior',
        'hover:shadow-paladin',
        'hover:shadow-hunter',
        'hover:shadow-rogue',
        'hover:shadow-priest',
        'hover:shadow-shaman',
        'hover:shadow-mage',
        'hover:shadow-warlock',
        'hover:shadow-druid',
        'text-warrior',
        'text-paladin',
        'text-hunter',
        'text-rogue',
        'text-priest',
        'text-shaman',
        'text-mage',
        'text-warlock',
        'text-druid',
        'text-pink',
        'bg-warrior',
        'bg-paladin',
        'bg-hunter',
        'bg-rogue',
        'bg-priest',
        'bg-shaman',
        'bg-mage',
        'bg-warlock',
        'bg-druid',
        'border-warrior',
        'border-paladin',
        'border-hunter',
        'border-rogue',
        'border-priest',
        'border-shaman',
        'border-mage',
        'border-warlock',
        'border-druid',
        'text-legendary',
        'text-legendary-900',
        'text-epic',
        'text-epic-900',
        'text-rare',
        'text-rare-900',
        'text-uncommon',
        'text-uncommon-900',
        'text-common',
        'text-common-900',
        'border-legendary',
        'border-legendary-900',
        'border-epic',
        'border-epic-900',
        'border-rare',
        'border-rare-900',
        'border-uncommon',
        'border-uncommon-900',
        'border-common',
        'border-common-900',
        'bg-legendary',
        'bg-legendary-900',
        'bg-epic',
        'bg-epic-900',
        'bg-rare',
        'bg-rare-900',
        'bg-uncommon',
        'bg-uncommon-900',
        'bg-common',
        'bg-common-900',
        'bg-relic',
        'bg-relic-900',
        'bg-pink-900',
        'border-stone-100',
        'bg-wood-900',
    ],
    theme: {
        extend: {
            keyframes: {
                wiggle: {
                    '0%, 100%': {transform: 'rotate(-3deg)'},
                    '50%': {transform: 'rotate(3deg)'},
                }
            },
            animation: {
                wiggle: 'wiggle .4s ease-in-out infinite',
            },
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
                ['wood-900']: '#24201d',
                wood: '#423B35',
                //wood: '#24201d',
                ['wood-50']: '#7d6e67',
                ['wood-100']: '#5f5a53',
                stone: '#797467',
                ['stone-100']: '#afad9a',
                moss: '#3E5C4F',
                ['moss-100']: '#5C7A6A',
                sky: '#A2B5BB',
                ivory: '#DBD2C3',
                gold: '#C9A866',
                ['gold-100']: '#E5CC80',
                legendary: "#FF8000",
                ['legendary-900']: "rgba(255,128,0,0.3)",
                epic: "#A335EE",
                ['epic-900']: "rgba(107,24,163,0.3)",
                rare: "#0070f3",
                ['rare-900']: "rgba(0,112,243,0.3)",
                uncommon: "#00FF00",
                ['uncommon-900']: "rgba(0,255,0,0.3)",
                common: "#FFFFFF",
                ['common-900']: "rgba(255,255,255,0.3)",
                relic: "#e5cc80",
                ['relic-900']: "rgba(229,204,128,0.3)",
                pink: "#e268a8",
                ['pink-900']: "rgba(226,104,168,0.3)",
                battlenet: "#0074e0",
                discord: "#7289da",
                warrior: "#C79C6E",
                paladin: "#F58CBA",
                hunter: "#ABD473",
                rogue: "#FFF569",
                priest: "#FFFFFF",
                deathknight: "#C41F3B",
                shaman: "#0070DE",
                mage: "#40C7EB",
                warlock: "#8787ED",
                monk: "#00FF96",
                druid: "#FF7D0A",
                demonhunter: "#A330C9",
                unknown: "#FFFFFF",
            },
        },
    },
    darkMode: "class",
    plugins: [heroui()],
};
export default config;
