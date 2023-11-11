import { generateToken, saveToken, checkNonceUsed, markNonceAsUsed } from './utils.js';
import jwt from 'jsonwebtoken';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config/firebaseConfig.js';

import { env, transporter } from './config/config.js';

export async function verifyUser(req, res) {
	const { userId, email } = req.body;
	console.log('Nuevo intento de verificación');
	console.log('userId:', userId);
	console.log('email:', email);
	try {
		const usersRef = collection(db, 'users');
		const q = query(usersRef, where('userId', '==', userId));
		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) {
			const token = generateToken(userId);
			const registrationLink = `${env.CLIENT_URL}/api/registro?token=${token}`;
			const mailOptions = {
				from: `"CIDDT-WEB Registro de Usuario" <${env.MAILER_EMAIL}>`,
				to: env.CLIENT_MAIL,
				subject: 'Intento de registro de Usuario',
				text: `Un nuevo usuario con el ID ${userId} y el correo ${email} quiere registrarse.\n Para completar su registro, haz clic en el siguiente enlace: ${registrationLink}`,
			};
			await transporter.sendMail(mailOptions);
			await saveToken(userId, token); // Guarda el token en Firestore
			res.status(200).send('Correo enviado para completar el registro');
			console.log('Correo enviado para completar el registro');
		} else {
			res.status(400).send('El usuario ya existe');
		}
	} catch (error) {
		console.error('Error al verificar el usuario:', error);
		res.status(500).send('Error interno del servidor');
	}
}

export async function registerUser(req, res) {
	const { token } = req.query;
	console.log(`Intento de registro con token: ${token}`);
	try {
		const decoded = jwt.verify(token, env.JWT_SECRET);
		console.log(`Token decodificado, userId: ${decoded.userId}`);

		// Verifica si el nonce ya ha sido utilizado
		const nonceUsed = await checkNonceUsed(token);
		if (nonceUsed) {
			return res.status(401).send('Token ya utilizado o inválido');
		}

		// Marca el nonce como usado
		await markNonceAsUsed(token);

		// Lógica de registro con decoded.userId
		console.log(`Registro exitoso para userId: ${decoded.userId}`);
		res.status(200).send('Registro exitoso: ' + decoded.userId);
	} catch (error) {
		console.error(`Error al verificar el token: ${error.message}`);
		res.status(401).send('Token inválido o expirado');
	}
}
