/** @type {import('tailwindcss').Config} */

const plugin = require('tailwindcss/plugin');

const rotateY = plugin(function ({ addUtilities }) {
	addUtilities({
		'.rotate-y-0': {
			transform: 'rotateY(0deg)',
		},
		'.rotate-y-20': {
			transform: 'rotateY(20deg)',
		},
		'.rotate-y-40': {
			transform: 'rotateY(40deg)',
		},
		'.rotate-y-45': {
			transform: 'rotateY(45deg)',
		},
		'.rotate-y-60': {
			transform: 'rotateY(60deg)',
		},
		'.rotate-y-80': {
			transform: 'rotateY(80deg)',
		},
		'.rotate-y-90': {
			transform: 'rotateY(90deg)',
		},
		'.rotate-y-100': {
			transform: 'rotateY(100deg)',
		},
		'.rotate-y-120': {
			transform: 'rotateY(120deg)',
		},
		'.rotate-y-140': {
			transform: 'rotateY(140deg)',
		},
		'.rotate-y-160': {
			transform: 'rotateY(160deg)',
		},
		'.rotate-y-180': {
			transform: 'rotateY(180deg)',
		},
	});
});

// Let's create a plugin that adds utilities!
const capitalizeFirst = plugin(function ({ addUtilities }) {
	const newUtilities = {
		'.capitalize-first:first-letter': {
			textTransform: 'uppercase',
		},
	};
	addUtilities(newUtilities, ['responsive', 'hover']);
});

module.exports = {
	content: ['./src/**/*.{html,js,astro,ts,tsx,jsx,md,mdx}'],
	theme: {
		extend: {
			backgroundImage: {
				'instagram-gradient': 'linear-gradient(45deg, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
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
					DEFAULT: '#ba1b1a',
					400: '#ba1b1a',
					700: '#b60019',
				},
				white: '#F0E7E0',
				gray: {
					DEFAULT: '#b0b0b0',
					400: '#b0b0b0',
				},
				black: '#0A0801',
				blue: {
					DEFAULT: '#0096ec',
				},
				green: {
					DEFAULT: '#4ade80',
				},
				yellow: {
					DEFAULT: '#eab308',
				},
				text: '#0A0801',
				background: '#F0E7E0',
				primary: '#163330',
				secondary: '#CB9E50',
				accent: '#5D2A2C',
				inverse: '#e9cccf',
			},
		},
		fontFamily: {
			sans: ['Gelion', 'sans-serif'],
		},
	},
	plugins: [rotateY, capitalizeFirst],
	safelist: [
		{
			pattern: /(bg|text|border)-(transparent|current|red-400|red-700|white|gray-400|black)/,
		},
	],
	darkMode: 'class',
};
