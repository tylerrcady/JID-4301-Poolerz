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
                background: "var(--background)",
                foreground: "var(--foreground)",
                lightblue: "#A5C2CF",
                blue: "#4B859F",
                b: "#4B859F",
                yellow: "#FECC01",
                y: "#FECC01",
                p: "#FFBFA0",
                d: "#282936",
                w: "#FFFFFF",
                white: "#FFFFFF",
                black: "#000000",
                lightgray: "#F7F7F7",
                gray: "#575757",
                darkgray: "#666666",
                r: "#E60606",
                dr: "#7d0101",
                red: "#E60606",
                darkred: "#7d0101",
            },
        },
    },
    plugins: [],
};
export default config;
