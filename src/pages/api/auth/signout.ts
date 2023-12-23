import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ redirect, cookies }) => {
	cookies.delete('session', {
		path: '/',
	});
	cookies.delete('userpages', {
		path: '/ciddt-admin',
	});
	console.log('user logged out');
	return redirect('/ciddt-admin/login');
};
