/* eslint-disable import/no-named-as-default-member */
import { generateToken, saveToken, checkNonceUsed, markNonceAsUsed } from './utils.js';
import jwt from 'jsonwebtoken';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './config/firebaseConfig.js';

import { env, transporter } from './config/config.js';

export async function verifyUser(req, res) {
	const { userId, email, name } = req.body;
	console.log('\n****************************************');
	console.log('Nuevo intento de verificación');
	console.log('userId:', userId);
	console.log('email:', email);

	try {
		// Verificar si el usuario ya existe
		const userDocRef = doc(db, 'users', userId);
		const userDocSnapshot = await getDoc(userDocRef);

		if (userDocSnapshot.exists()) {
			// El usuario ya existe en la base de datos
			res.status(400).json({ message: 'El usuario ya existe' });
			return;
		}

		// Verificar si ya existe un token de registro para este usuario
		const tokenDocRef = doc(db, 'registrationTokens', userId);
		const tokenDocSnapshot = await getDoc(tokenDocRef);

		if (tokenDocSnapshot.exists()) {
			// Comprobar la fecha de expiración del token
			const tokenData = tokenDocSnapshot.data();
			const now = new Date();
			if (now < tokenData.expireAt.toDate()) {
				// El token todavía es válido, enviar mensaje de error
				console.log(
					`Ya se ha enviado un enlace de registro. Por favor, espere hasta ${tokenData.expireAt.toDate()} para enviar otro.`,
				);
				res.status(400).json({
					message: `Ya se ha enviado un enlace de registro. Por favor, espere hasta ${tokenData.expireAt.toDate()} para enviar otro.`,
				});
				return;
			}
		}

		// Si no hay token o el token ha expirado, proceder con la creación de un nuevo token
		const token = generateToken(userId);
		const registrationLink = `${env.CLIENT_URL}/ciddt-admin/registro?token=${token}`;
		const mailOptions = {
			from: `"CIDDT-WEB Registro de Usuario" <${env.MAILER_EMAIL}>`,
			to: env.CLIENT_MAIL,
			subject: 'Intento de registro de Usuario',
			text: `Un nuevo usuario con el nombre ${name}, el ID ${userId} y el correo ${email} quiere registrarse.\n Para completar su registro, haz clic en el siguiente enlace: ${registrationLink}`,
		};
		await saveToken(userId, token, name); // Guarda el token en Firestore
		await transporter.sendMail(mailOptions);
		res.status(200).json({ message: 'Correo enviado para completar el registro' });
		console.log('Correo enviado para completar el registro');
	} catch (error) {
		console.error('Error al verificar el usuario:', error);
		res.status(500).json({ message: error.message });
	}
}

export async function registerUser(req, res) {
	const { token } = req.query;
	console.log('\n****************************************');
	console.log(`Intento de registro con token: ${token}`);
	try {
		const decoded = jwt.verify(token, env.JWT_SECRET);
		console.log(`Token decodificado, userId: ${decoded.userId}`);

		// Verifica si el nonce ya ha sido utilizado
		const nonceUsed = await checkNonceUsed(token);
		if (nonceUsed == true) {
			console.error(`Token ya utilizado o inválido`);
			return res.status(401).json({ message: 'Token ya utilizado o inválido' });
		}

		// Marca el nonce como usado
		await markNonceAsUsed(token);

		// Lógica de registro con decoded.userId
		console.log(`Registro exitoso para userId: ${decoded.userId}`);
		res.status(200).json({ message: 'Registro exitoso', userId: decoded.userId });
	} catch (error) {
		console.error(`Error al verificar el token: ${error.message}`);
		res.status(401).json({ message: 'Token inválido o expirado' });
	}
}
