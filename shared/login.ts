/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
	createUserWithEmailAndPassword,
	FacebookAuthProvider,
	getAuth,
	signInWithEmailAndPassword,
	signInWithPopup,
	updateProfile,
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { type popUp } from 'frontend/src/interfaces/popUp';

import { app, db } from '../backend/config/firebaseConfig';

const serverUrl = import.meta.env.PUBLIC_SERVER_URL;

// Obtener la instancia de autenticación
const auth = getAuth(app);

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

		// Consultar Firestore para obtener el nombre asociado con el userId
		const tokensRef = collection(db, 'registrationTokens');
		const q = query(tokensRef, where('userId', '==', data.userId));
		const querySnapshot = await getDocs(q);
		let displayName = '';
		querySnapshot.forEach((doc) => {
			displayName = typeof doc.data().name === 'string' ? doc.data().name : username;
		});

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

// Iniciar sesión con Email y Contraseña
const loginWithEmail = async (email: string, password: string): Promise<popUp> => {
	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		// Usuario logeado
		console.log(`Bienvenido ${userCredential.user.displayName}`);
		return {
			type: 'success',
			title: 'Inicio de Sesión Exitoso',
			message: `Bienvenido ${userCredential.user.displayName}`,
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
				title: 'Cuenta detectada',
				message: `Bienvenido ${result.user.displayName}`,
			};
		} else {
			try {
				const response = await fetch(serverUrl + '/verify-user/', {
					method: 'post',
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
				return {
					type: 'warning',
					title: 'Nuevo usuario detectado',
					message: `Hola ${result.user.displayName}, para completar tu registro revisa el link en el correo electrónico del administrador`,
				};
			} catch (error: any) {
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
export { loginWithEmail, loginWithFacebook, registerNewUser };
