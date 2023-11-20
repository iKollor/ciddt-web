/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
	createUserWithEmailAndPassword,
	deleteUser,
	FacebookAuthProvider,
	signInWithPopup,
	updateProfile,
	type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { InputPopup } from 'frontend/src/hooks/popupStores';
import { type popUp } from 'frontend/src/interfaces/popUp';

import { auth, db } from './client';

const serverUrl = import.meta.env.PUBLIC_SERVER_URL;

const registerNewUser = async (
	registrationToken: string,
	username: string,
	email: string,
	password: string,
): Promise<popUp> => {
	try {
		// Verificar el token con el backend
		const response = await fetch(`${serverUrl}/registro?token=${registrationToken}`);
		const data = await response.json();
		if (!response.ok) {
			const errorMessage =
				typeof data.message === 'string'
					? data.message
					: `Error del servidor: ${response.status} ${response.statusText}`;
			throw new Error(errorMessage);
		}

		// Consultar Firestore para obtener el nombre asociado con el token
		const tokenDocRef = doc(db, 'registrationTokens', registrationToken);
		const tokenDocSnapshot = await getDoc(tokenDocRef);
		let displayName = '';
		if (tokenDocSnapshot.exists()) {
			displayName = tokenDocSnapshot.data().name ?? username;
		}

		// Crear el usuario en Firebase
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);

		// Actualizar el perfil del usuario con el displayName
		if (displayName !== '') {
			await updateProfile(userCredential.user, { displayName });
		}
		const firebaseUserId = userCredential.user.uid;

		// Almacenar los datos adicionales del usuario en Firestore
		await setDoc(doc(db, 'users', data.userId), {
			username,
			email,
			userId: firebaseUserId, // Usando el userId del backend
			displayName,
		});

		console.log(`Registro exitoso`);
		return {
			type: 'success',
			title: 'Registro Exitoso',
			message: 'Ya puedes cerrar esta ventana e iniciar sesión',
		};
	} catch (error: any) {
		console.log(`Error en el registro: ${error}`);
		return {
			type: 'danger',
			title: 'Error inesperado',
			message: 'Ha ocurrido un error durante el proceso de registro: ' + error,
		};
	}
};

const loginWithFacebook = async () => {
	const provider = new FacebookAuthProvider();

	// Especificar scopes adicionales
	const scopes = [
		'public_profile',
		'email',
		'instagram_basic',
		'pages_show_list',
		'pages_read_engagement',
		'pages_read_user_content',
	];
	scopes.forEach((scope) => provider.addScope(scope));

	let userCreated = false;
	let user: User | null = null;

	try {
		const result = await signInWithPopup(auth, provider);
		const credential = FacebookAuthProvider.credentialFromResult(result);

		if (credential == null) {
			throw new Error('No se pudo obtener la credencial de Facebook');
		}

		console.log(credential.accessToken);
		const idToken = await result.user.getIdToken();

		user = result.user;

		userCreated = true;

		console.log(result);

		const docRef = doc(db, 'users', user.uid);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			// El usuario existe, manejar el inicio de sesión
			try {
				const response = await fetch('/api/auth/signin', {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${idToken}`,
					},
				});
				if (response.redirected) {
					window.location.assign(response.url);
				} else {
					return {
						type: 'danger',
						title: 'Error en el Inicio de Sesión',
						message: `Ocurrió un error desconocido`,
					};
				}
			} catch (error: any) {
				return {
					type: 'danger',
					title: 'Error en el Inicio de Sesión',
					message: `${error.message}`,
				};
			}
			return {
				type: 'success',
				title: 'Cuenta detectada',
				message: `Bienvenido ${result.user.displayName}`,
			};
		} else {
			return await handleNewUser(user, userCreated);
		}
	} catch (error: any) {
		console.log(`Error al intentar logearse con facebook: ${error}`);
		return {
			type: 'danger',
			title: 'Error en el Inicio de Sesión con Facebook',
			message: `Hubo un problema al intentar iniciar sesión con Facebook: ${error}`,
		};
	}
};

const handleNewUser = async (user: User, userCreated: boolean) => {
	try {
		if (user.email == null) {
			const email = await requestUserEmail();

			if (email.length > 0) {
				// Actualiza el correo electrónico del usuario en Firebase
				const body = JSON.stringify({
					userUID: user.uid,
					email,
				});
				const response = await fetch(serverUrl + '/updateEmail/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body,
				});

				const data = await response.json();

				if (!response.ok) {
					const errorMessage =
						typeof data.message === 'string'
							? data.message
							: `Error del servidor: ${response.status} ${response.statusText}`;
					throw new Error(errorMessage);
				}
				console.log('Respuesta del servidor:', data.message);
			} else {
				throw new Error('No se proporcionó un correo electrónico válido');
			}
		}
		const body = JSON.stringify({
			userId: user.uid,
			name: user.displayName,
			email: user.email,
		});
		const response = await fetch(serverUrl + '/verify-user/', {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
			},
			body,
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(JSON.stringify({ message: data.message, date: data.date })); // Objeto literal
		}

		console.log('Respuesta del servidor:', data.message);
		return {
			type: 'warning',
			title: 'Nuevo usuario detectado',
			message: `Hola ${user.displayName}, para completar tu registro revisa el link en el correo electrónico del administrador`,
		};
	} catch (error: any) {
		console.error('Error en la solicitud fetch:', error.message);

		const { message, date } = parseErrorMessage(error);

		if (userCreated && user != null && date === '') {
			await safeDeleteUser(user);
		}

		return {
			type: 'danger',
			title: 'Error de Registro',
			message: `${message}${date != null ? ` Por favor, espere hasta ${date} para enviar otro.` : ''}`,
		};
	}
};

const parseErrorMessage = (error: any): { message: string; date: string } => {
	let errorMessage = 'Error desconocido';
	let errorDate = '';

	if (typeof error.message === 'string' && isJsonString(error.message)) {
		try {
			const errorObj = JSON.parse(error.message);
			errorMessage = errorObj.message ?? errorMessage;
			if (errorObj.date != null) {
				const date = new Date(errorObj.date);
				errorDate = date.toLocaleString();
			}
		} catch (e) {
			errorMessage = error.message;
		}
	} else {
		errorMessage = error.message ?? errorMessage;
	}

	return { message: errorMessage, date: errorDate };
};

const isJsonString = (str: string): boolean => {
	try {
		JSON.parse(str);
		return true;
	} catch (e) {
		return false;
	}
};

const safeDeleteUser = async (user: User) => {
	try {
		await deleteUser(user);
	} catch (error: any) {
		console.error('Error al eliminar usuario:', error);
	}
};

async function requestUserEmail(): Promise<string> {
	// Mostrar el popup
	InputPopup.set({
		visible: true,
		content: '',
	});

	return await new Promise((resolve, reject) => {
		const unsubscribe = InputPopup.subscribe((state) => {
			// Comprobar si el popup está cerrado
			if (!state.visible) {
				if (validateEmail(state.content)) {
					resolve(state.content);
				} else {
					reject(new Error('Correo electrónico no válido o cancelado por el usuario'));
				}
				unsubscribe();
			}
		});
	});
}

function validateEmail(email: string): boolean {
	// Expresión regular básica para validar un correo electrónico
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return regex.test(email) && email.length > 0;
}

// Exportar las funciones para usarlas en otros archivos
export { loginWithFacebook, registerNewUser };
