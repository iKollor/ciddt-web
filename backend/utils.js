import jwt from 'jsonwebtoken';
import { collection, query, where, getDocs, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
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

export async function saveToken(userId, token) {
	// Crea y ajusta el objeto Date
	const now = new Date();
	now.setHours(now.getHours() + 1);
	// Crea un Timestamp de Firestore a partir del objeto Date
	const expireAt = Timestamp.fromDate(now);

	const tokenDoc = {
		userId: userId,
		token: token,
		used: false,
		expireAt: expireAt,
	};
	console.log(`Guardando token en db para userId: ${userId}`);
	await addDoc(collection(db, 'registrationTokens'), tokenDoc);
}

export async function markNonceAsUsed(token) {
	const tokensRef = collection(db, 'registrationTokens');
	const q = query(tokensRef, where('token', '==', token));
	const querySnapshot = await getDocs(q);

	if (!querySnapshot.empty) {
		const docRef = querySnapshot.docs[0].ref;
		await updateDoc(docRef, { used: true });
		console.log(`Nonce marcado como usado para el token: ${token}`);
	} else {
		console.log(`No se encontró el token para marcar como usado: ${token}`);
	}
}

export async function checkNonceUsed(token) {
	const tokensRef = collection(db, 'registrationTokens');
	const q = query(tokensRef, where('token', '==', token));
	const querySnapshot = await getDocs(q);

	if (!querySnapshot.empty) {
		const doc = querySnapshot.docs[0];
		console.log(`Token encontrado, usado: ${doc.data().used}, token: ${token}`);
		return doc.data().used;
	} else {
		console.log(`Token no encontrado en la base de datos: ${token}`);
		return false; // Retorna false si el token no existe
	}
}
