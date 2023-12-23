import type { APIRoute } from 'astro';

const CLIENT_KEY = import.meta.env.SERVER_CLIENT_KEY_TIKTOK;
const SERVER_ENDPOINT_REDIRECT = import.meta.env.SERVER_ENDPOINT_REDIRECT_TIKTOK;

export const GET: APIRoute = async ({ cookies }) => {
	const csrfState = Math.random().toString(36).substring(2);

	const fivedays = 60 * 60 * 24 * 5;
	const fivedaysToDate = new Date(Date.now() + fivedays * 1000);

	cookies.set('csrfState', csrfState, { expires: fivedaysToDate });

	let url = 'https://www.tiktok.com/v2/auth/authorize/';

	url += `?client_key=${CLIENT_KEY}`;
	url += '&response_type=code';
	url += '&scopes=user.info.basic,user.info.stats,video.list';
	url += `&redirect_uri=${SERVER_ENDPOINT_REDIRECT}`;
	url += `&state=${csrfState}`;

	console.log(url);

	// Enviar una respuesta de redirección HTTP al cliente
	return new Response(null, {
		status: 302,
		headers: {
			Location: url,
		},
	});
};
