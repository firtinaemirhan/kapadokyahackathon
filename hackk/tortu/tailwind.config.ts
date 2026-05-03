import type { Config } from "tailwindcss";
const config:Config={darkMode:["class"],content:["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}","./lib/**/*.{ts,tsx}"],theme:{extend:{fontFamily:{sans:["var(--font-inter)"],serif:["var(--font-display)"]},colors:{background:"#F5F1E8",foreground:"#1A1A1A"},borderRadius:{lg:"0.5rem"}}},plugins:[]};
export default config;
