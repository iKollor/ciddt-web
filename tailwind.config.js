/** @type {import('tailwindcss').Config} */

const { colors: defaultColors } = require('tailwindcss/defaultTheme');

export default {
	content: ['./frontend/src/**/*.{html,js,astro,ts,tsx,jsx}'],
	theme: {
		extend: {
			dropShadow: {
				custom: '5px 5px 0px #1d1d1b',
			},
			colors: {
				red: {
					DEFAULT: '#db001c',
					400: '#db001c',
					700: '#b60019',
				},
				white: '#f8f8f8',
				gray: {
					DEFAULT: '#b0b0b0',
					400: '#b0b0b0',
				},
				black: '#1d1d1b',
				blue: {
					DEFAULT: '#0096ec',
				},
				green: {
					DEFAULT: '#4ade80',
				},
				yellow: {
					DEFAULT: '#eab308',
				},
			},
		},
		fontFamily: {
			sans: ['Gelion', 'sans-serif'],
		},
	},
	plugins: [],
	safelist: [
		{
			pattern: /(bg|text|border)-(transparent|current|red-400|red-700|white|gray-400|black)/,
		},
	],
	darkMode: 'class',
};
