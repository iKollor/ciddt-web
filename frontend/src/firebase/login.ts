/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
	createUserWithEmailAndPassword,
	deleteUser,
	FacebookAuthProvider,
	linkWithCredential,
	signInWithPopup,
	updateProfile,
	type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { InputPopup } from 'frontend/src/hooks/popupStores';
import { type popUp } from 'frontend/src/interfaces/popUp';

import { auth, db } from './client';

const serverUrl = import.meta.env.PUBLIC_SERVER_URL;

// ------------------------------------------ Funciones principales ---------------------------------------------------------
const registerNewUser = async (
	registrationToken: string,
	username: string,
	email: string,
	password: string,
): Promise<popUp> => {
	try {
		// Crear el usuario en Firebase
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		const firebaseUser = userCredential.user;

		// Verificar el token con el backend
		const response = await fetch(`${serverUrl}/registro?token=${registrationToken}&email=${email}`);
		const data = await response.json();
		if (!response.ok) {
			await safeDeleteUser(firebaseUser);
			const errorMessage =
				typeof data.message === 'string'
					? data.message
					: `Error del servidor: ${response.status} ${response.statusText}`;
			throw new Error(errorMessage);
		}

		// Consultar Firestore para obtener el nombre asociado con el token
		const tokenDocRef = doc(db, 'registrationTokens', data.userId);
		const tokenDocSnapshot = await getDoc(tokenDocRef);
		const displayName = tokenDocSnapshot.exists() ? tokenDocSnapshot.data().name ?? username : username;
		const accessToken = tokenDocSnapshot.exists() ? tokenDocSnapshot.data().accessToken : null;

		// Crear una credencial de Facebook con el accessToken
		const facebookCredential = FacebookAuthProvider.credential(accessToken);

		// Vincular la cuenta de Facebook con el usuario recién creado
		await linkWithCredential(firebaseUser, facebookCredential);
		console.log('Cuentas vinculadas');

		// Actualizar el perfil del usuario con el displayName
		if (displayName !== '') {
			await updateProfile(firebaseUser, { displayName });
		}

		// Almacenar los datos adicionales del usuario en Firestore
		await setDoc(doc(db, 'users', firebaseUser.uid), {
			username,
			email,
			userId: firebaseUser.uid, // Usando el userId de Firebase
			displayName,
		});

		console.log(`Registro exitoso`);
		return {
			visible: true,
			type: 'success',
			title: 'Registro Exitoso',
			message: 'Ya puedes cerrar esta ventana e iniciar sesión',
		};
	} catch (error: any) {
		console.error(`Error en el registro: ${error}`);

		return {
			visible: true,
			type: 'danger',
			title: 'Error inesperado',
			message: 'Ha ocurrido un error durante el proceso de registro: ' + error,
		};
	}
};

const loginWithFacebook = async (): Promise<popUp> => {
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

	let user: User | null = null;

	try {
		const result = await signInWithPopup(auth, provider);
		const credential = FacebookAuthProvider.credentialFromResult(result);

		if (credential == null) {
			throw new Error('No se pudo obtener la credencial de Facebook');
		}

		const accessToken = credential.accessToken;

		const idToken = await result.user.getIdToken();

		user = result.user;

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
						visible: true,
						type: 'danger',
						title: 'Error en el Inicio de Sesión',
						message: `Ocurrió un error desconocido`,
					};
				}
			} catch (error: any) {
				return {
					visible: true,
					type: 'danger',
					title: 'Error en el Inicio de Sesión',
					message: `${error.message}`,
				};
			}
			return {
				visible: true,
				type: 'success',
				title: 'Cuenta detectada',
				message: `Bienvenido ${result.user.displayName}`,
			};
		} else {
			if (accessToken != null) {
				return await handleNewUser(user, accessToken);
			}
		}
	} catch (error: any) {
		console.log(`Error al intentar ingresar con facebook: ${error}`);
		if (error === 'FirebaseError: [code=unavailable]: Failed to get document because the client is offline.') {
			return {
				visible: true,
				type: 'danger',
				title: 'Error en el Inicio de Sesión',
				message: `No se pudo conectar con el servidor, por favor intente nuevamente en unos segundos o recargue la página`,
			};
		}
		return {
			visible: true,
			type: 'danger',
			title: `Error en el Inicio de Sesión con Facebook`,
			message: `${error}`,
		};
	}
	return {
		visible: true,
		type: 'danger',
		title: 'Error en el Inicio de Sesión',
		message: 'Ocurrió un error desconocido',
	};
};

const handleNewUser = async (user: User, accessToken: string): Promise<popUp> => {
	try {
		let email: string | null = null;
		if (user.email == null) {
			email = await requestUserEmail();
		}
		const userUID = user.providerData[0].uid;

		const body = JSON.stringify({
			userId: userUID,
			name: user.displayName,
			email: user.email ?? email,
			accessToken,
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
			visible: true,
			type: 'warning',
			title: 'Nuevo usuario detectado',
			message: `Hola ${user.displayName}, para completar tu registro revisa el link en el correo electrónico del administrador`,
		};
	} catch (error: any) {
		console.error('Error en la solicitud fetch:', error.message);

		const { message, date } = parseErrorMessage(error);

		return {
			visible: true,
			type: 'danger',
			title: 'Error de Registro',
			message: `${message}${date !== '' ? ` Por favor, espere hasta ${date} para enviar otro.` : ''}`,
		};
	} finally {
		safeDeleteUser(user).catch((e) => {
			return {
				visible: true,
				type: 'danger',
				title: 'Error al eliminar usuario',
				message: `${e.message}`,
			};
		});
	}
};

// ------------------------------------------ Funciones de utilidad ---------------------------------------------------------

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
