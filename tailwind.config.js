/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {},
  },
  // Keep topic badge utilities available even when applied dynamically
  safelist: [
    "bg-green-600",
    "bg-teal-500",
    "bg-orange-500",
    "bg-purple-600",
    "bg-emerald-600",
    "bg-pink-500",
    "bg-blue-500",
    "bg-indigo-600",
    "bg-cyan-600",
    "bg-amber-600",
    "bg-violet-600",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-cyan-500",
    "bg-gray-500",
  ],
  plugins: [],
};
