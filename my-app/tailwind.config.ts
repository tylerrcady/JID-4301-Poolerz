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
                b: "#4E85A1",
                y: "#FECC04",
                p: "#FFBFA0",
                d: "#282936",
                w: "#FFFFFF",
            },
        },
    },
    plugins: [],
};
export default config;
