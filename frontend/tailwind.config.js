/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#EDEAE2",
        ink: "#17161A",
        violet: "#4C3B73",
        brass: "#B8935A",
        line: "#B7AF9E",
        panel: "#F5F3EE",
        muted: "#8A8271",
      },
      fontFamily: {
        serif: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        riseIn: { from: { opacity: 0, transform: "translateY(10px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        scanline: { "0%": { top: "0%" }, "50%": { top: "96%" }, "100%": { top: "0%" } },
      },
      animation: {
        riseIn: "riseIn 0.5s ease both",
        scanline: "scanline 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
