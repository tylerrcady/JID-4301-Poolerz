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
                blue: "#4B859F",
                lightblue: "#A5C2CF",
                yellow: "#FECC01",
                p: "#FFBFA0",
                d: "#282936",
                white: "#FFFFFF",
                gray: "#666666",
                red: "#E60606",
                darkred: "#7d0101"
            },
        },
    },
    plugins: [],
};
export default config;
