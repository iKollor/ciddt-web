import { app } from '@firebase/server'; // Asegúrate de que esta ruta sea correcta para tu configuración de Firebase
import type { APIRoute } from 'astro';
import { getAuth } from 'firebase-admin/auth';

export const GET: APIRoute = async ({ cookies }) => {
	const sessionCookie = cookies.get('session');
	const auth = getAuth(app);

	if (sessionCookie == null) {
		return new Response(null, { status: 401 });
	}

	try {
		const decodedClaims = await auth.verifySessionCookie(sessionCookie.value, true);

		// Opcional: Puedes generar un nuevo token de ID si es necesario
		// const idToken = await auth.createCustomToken(decodedClaims.uid);

		// Retorna una respuesta positiva, y opcionalmente un nuevo token de ID
		return new Response(JSON.stringify({ valid: true, uid: decodedClaims.uid /*, idToken: idToken */ }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (error) {
		// Si la verificación de la cookie de sesión falla
		return new Response(null, { status: 401 });
	}
};
