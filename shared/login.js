import { app, db } from './config/firebaseConfig';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, FacebookAuthProvider } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Obtener la instancia de autenticación
const auth = getAuth(app);

// Iniciar sesión con Email y Contraseña
const loginWithEmail = async (email, password) => {
	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		//Usuario logeado
		console.log('Bienvenido' + userCredential.user);
	} catch (error) {
		// Manejar errores aquí, como un usuario no encontrado o una contraseña incorrecta
		console.log('Error usuario o contraseña incorrecta');
	}
};

// Iniciar sesión con Facebook
const loginWithFacebook = async () => {
	const provider = new FacebookAuthProvider();

	// Especificar scopes adicionales
	provider.addScope('email');
	provider.addScope('pages_read_engagement');
	provider.addScope('instagram_basic');
	provider.addScope('pages_show_list');

	try {
		const result = await signInWithPopup(auth, provider);
		// Esto le da un token de acceso de Facebook que puedes usar para acceder a la Graph API
		const token = result.credential.accessToken;
		// La información del usuario se encuentra en result.user

		const user = result.user;

		// Verificar si el usuario ya existe en Firestore
		const docRef = doc(db, 'users', user.uid);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			// El usuario existe, manejar el inicio de sesión
		} else {
			console.log('El usuario no existe, enviando correo electronico');
			sendEmailToAdmin(user);
		}
	} catch (error) {
		// Manejar errores aquí
	}
};

// Exportar las funciones para usarlas en otros archivos
export { loginWithEmail, loginWithFacebook };
