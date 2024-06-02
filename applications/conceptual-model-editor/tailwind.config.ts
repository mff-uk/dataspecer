import { type Config } from "tailwindcss";
import { ColorPalette } from "./src/app/util/color-utils";

export default {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
          colors: { ...ColorPalette },
        },
    },
    plugins: [],
} satisfies Config;
