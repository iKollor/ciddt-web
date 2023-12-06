/** @type {import('tailwindcss').Config} */

const { colors: defaultColors } = require('tailwindcss/defaultTheme');

export default {
	content: ['./frontend/src/**/*.{html,js,astro,ts,tsx,jsx}'],
	theme: {
		extend: {
			backgroundImage: {
				'instagram-gradient':
					'linear-gradient(45deg, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
			},
			dropShadow: {
				custom: '5px 5px 0px #1d1d1b',
				custom2: '0px 0px 10px rgba(0, 248, 137, 0.5)',
			},
			colors: {
				edgewater: {
					50: '#ebf5eb',
					100: '#cee9cf',
					200: '#a8d6b4',
					300: '#7abd97',
					400: '#559b81',
					500: '#3e7e74',
					600: '#2f6565',
					700: '#27474f',
					800: '#21343f',
					900: '#1e2834',
					950: '#0b0f18',
				},
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
