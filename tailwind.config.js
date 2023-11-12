/** @type {import('tailwindcss').Config} */

const { colors: defaultColors } = require('tailwindcss/defaultTheme');

export default {
	content: ['./frontend/src/**/*.{html,js,astro,ts,tsx,jsx}'],
	theme: {
		extend: {
			colors: {
				...defaultColors,
				white: '#f8f8f8',
				dark: '#1d1d1b',
				gray: '#b0b0b0',
				red: '#db001c',
				dark_red: '#b60019',
				blue: '#0096ec',
				dark_blue: '#0075b9',
				yellow: '#eab308',
				green: '#4ade80',
			},
		},
		fontFamily: {
			sans: ['Gelion', 'sans-serif'],
		},
	},
	plugins: [],
	darkMode: 'class',
};
