import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                neutral: {
                    950: "#0a0a0a",
                },
            },
        },
    },
    plugins: [],
}

export default config
