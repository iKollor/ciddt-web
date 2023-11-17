import jwt from 'jsonwebtoken';
import { getDoc, doc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './config/firebaseConfig.js';

import { env } from './config/config.js';

// Tus funciones de utilidad

function generateNonce() {
	return Date.now().toString() + Math.random().toString(36).substring(2);
}

// Función para generar token
export function generateToken(userId) {
	const nonce = generateNonce();
	const payload = { userId, nonce };
	const options = { expiresIn: '1h' };
	console.log(`Token generado para ${userId} con nonce ${nonce}, expira en 1h`);
	return jwt.sign(payload, env.JWT_SECRET, options);
}

export async function saveToken(userId, token, name) {
	// Crea y ajusta el objeto Date
	const now = new Date();
	now.setHours(now.getHours() + 1);
	// Crea un Timestamp de Firestore a partir del objeto Date
	const expireAt = Timestamp.fromDate(now);

	if (userId === undefined || token === undefined || name === undefined) {
		console.error(
			`Error: Uno de los valores requeridos es undefined:\nuserId: ${userId}\ntoken: ${token}\nname: ${name}`,
		);
		throw new Error('Datos requeridos no proporcionados');
	}

	const tokenDoc = {
		name: name,
		userId: userId,
		token: token,
		used: false,
		expireAt: expireAt,
	};
	console.log(`Guardando token en db para userId: ${userId}`);

	// Utilizar setDoc para guardar el documento con un ID específico
	const tokenRef = doc(db, 'registrationTokens', token);
	await setDoc(tokenRef, tokenDoc);
}

export async function markNonceAsUsed(token) {
	const tokenDocRef = doc(db, 'registrationTokens', token);
	const tokenDocSnapshot = await getDoc(tokenDocRef);

	if (tokenDocSnapshot.exists()) {
		await updateDoc(tokenDocRef, { used: true });
		console.log(`Nonce marcado como usado para el token: ${token}`);
	} else {
		console.log(`No se encontró el token para marcar como usado: ${token}`);
	}
}

export async function checkNonceUsed(token) {
	const tokenDocRef = doc(db, 'registrationTokens', token);
	const tokenDocSnapshot = await getDoc(tokenDocRef);

	if (tokenDocSnapshot.exists()) {
		const docData = tokenDocSnapshot.data();
		console.log(`Token encontrado, usado: ${docData.used}`);
		return docData.used;
	} else {
		console.log(`Token no encontrado en la base de datos: ${token}`);
		throw new Error('Token inválido');
	}
}
