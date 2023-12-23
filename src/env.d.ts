/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="astro/client" />
/// <reference types="astro:transitions/client" />

declare module 'gsap/ScrollTrigger';
declare module 'springer';
declare module 'feather-icons-react';
declare module 'alpinejs';
declare module '';
declare module '*.json' {
	const value: any;
	export default value;
}

interface ImportMetaEnv {
	readonly FIREBASE_PRIVATE_KEY_ID: string;
	readonly FIREBASE_PRIVATE_KEY: string;
	readonly FIREBASE_PROJECT_ID: string;
	readonly FIREBASE_CLIENT_EMAIL: string;
	readonly FIREBASE_CLIENT_ID: string;
	readonly FIREBASE_AUTH_URI: string;
	readonly FIREBASE_TOKEN_URI: string;
	readonly FIREBASE_AUTH_CERT_URL: string;
	readonly FIREBASE_CLIENT_CERT_URL: string;
	readonly PUBLIC_SERVER_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
