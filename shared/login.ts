/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { FacebookAuthProvider, getAuth, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { type popUp } from 'frontend/src/interfaces/popUp';

import { app, db } from '../backend/config/firebaseConfig';

const clientUrl = import.meta.env.PUBLIC_CLIENT_URL;

// Obtener la instancia de autenticación
const auth = getAuth(app);

// Iniciar sesión con Email y Contraseña
const loginWithEmail = async (email: string, password: string): Promise<popUp> => {
	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		// Usuario logeado
		console.log(`Bienvenido ${userCredential.user.displayName}`);
		return {
			type: 'success',
			title: 'Inicio de Sesión Exitoso',
			message: 'Bienvenido ...',
		};
	} catch (error) {
		// Manejar errores aquí, como un usuario no encontrado o una contraseña incorrecta
		console.log('Error usuario o contraseña incorrecta');
		return {
			type: 'danger',
			title: 'Error de Inicio de Sesión',
			message: 'Usuario o contraseña incorrecta',
		};
	}
};

// Iniciar sesión con Facebook
const loginWithFacebook = async (): Promise<popUp> => {
	const provider = new FacebookAuthProvider();

	// Especificar scopes adicionales
	provider.addScope('public_profile');
	provider.addScope('email');
	provider.addScope('pages_read_engagement');
	provider.addScope('instagram_basic');
	provider.addScope('pages_show_list');

	try {
		const result = await signInWithPopup(auth, provider);
		// Esto le da un token de acceso de Facebook que puedes usar para acceder a la Graph API
		const credential = FacebookAuthProvider.credentialFromResult(result);
		const accessToken = credential?.accessToken;
		console.log(accessToken);

		// La información del usuario se encuentra en result.user
		const user = result.user;
		const uid = user.uid;
		const name = user.displayName;
		const email = user.email ?? '';

		console.log(`${uid} ${name} ${email}`);

		// Verificar si el usuario ya existe en Firestore
		const docRef = doc(db, 'users', user.uid);
		const docSnap = await getDoc(docRef);

		// cuerpo del post
		const body = JSON.stringify({
			userId: uid,
			name,
			email,
		});

		if (docSnap.exists()) {
			// El usuario existe, manejar el inicio de sesión
			console.log('Usuario existente, entrando...');
			return {
				type: 'success',
				title: 'Login Exitoso',
				message: `Bienvenido ${result.user.displayName}`,
			};
		} else {
			try {
				const response = await fetch(clientUrl + '/verify-user/', {
					method: 'post',
					headers: {
						'Content-Type': 'application/json',
					},
					body,
				});

				if (!response.ok) {
					const errorData = await response.json();
					const errorMessage =
						typeof errorData.message === 'string'
							? errorData.message
							: `Error del servidor: ${response.status} ${response.statusText}`;
					throw new Error(errorMessage);
				}

				const data = await response.json();
				console.log('Respuesta del servidor:', data.message);
				return {
					type: 'warning',
					title: 'Nuevo usuario detectado',
					message: `Hola ${result.user.displayName}, para completar tu registro revisa el link en el correo electrónico del administrador`,
				};
			} catch (error) {
				console.error('Error en la solicitud fetch:', error.message);
				const errorMessage =
					typeof error.message === 'string' ? error.message : 'Ocurrió un problema durante el registro.';
				return {
					type: 'danger',
					title: 'Error de Registro',
					message: errorMessage,
				};
			}
		}
	} catch (error: any) {
		console.log(`Error al intentar logearse con facebook: ${error}`);
		return {
			type: 'danger',
			title: 'Error en el Inicio de Sesión con Facebook',
			message: 'Hubo un problema al intentar iniciar sesión con Facebook: ' + error,
		};
	}
};

// Exportar las funciones para usarlas en otros archivos
export { loginWithEmail, loginWithFacebook };
