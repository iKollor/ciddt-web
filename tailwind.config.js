/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,astro,ts,tsx,jsx}'],
	theme: {
		colors: {
			white: '#f8f8f8',
			dark: '#1d1d1b',
			gray: '#b0b0b0',
			red: '#db001c',
			dark_red: '#cc001b',
			blue: '#0096ec',
			dark_blue: '#0075b9',
		},
		fontFamily: {
			sans: ['Gelion', 'sans-serif'],
		},
		extend: {},
	},
	plugins: [],
	darkMode: 'class',
};
