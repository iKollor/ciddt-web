import { app } from '@firebase/server';
import type { APIRoute } from 'astro';
import { getAuth } from 'firebase-admin/auth';

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
	const auth = getAuth(app);

	// Get token from request headers
	const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
	if (idToken == null) {
		return new Response('No token found', { status: 401 });
	}

	// Verify id token
	try {
		await auth.verifyIdToken(idToken);
	} catch (error) {
		return new Response('Invalid token', { status: 401 });
	}

	// Create and set session cookie
	const fiveDays = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
	try {
		const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: fiveDays });
		cookies.set('session', sessionCookie, { path: '/', httpOnly: true, secure: true });
		return redirect('/ciddt-admin/dashboard');
	} catch (error) {
		return new Response('Failed to create session cookie', { status: 500 });
	}
};
