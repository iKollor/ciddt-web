// config.js
import { createTransport } from 'nodemailer';
import { config } from 'dotenv';

config(); // dotenv initializer

export const env = {
	JWT_SECRET: process.env.JWT_SECRET,
	MAILER_EMAIL: process.env.MAILER_EMAIL,
	MAILER_PASSWORD: process.env.MAILER_PASSWORD,
	CLIENT_URL: process.env.CLIENT_URL,
	CLIENT_MAIL: process.env.CLIENT_MAIL,
	MAIL_SERVICE: process.env.MAIL_SERVICE,
};

// Configuración de Nodemailer
export const transporter = createTransport({
	service: env.MAIL_SERVICE,
	auth: { user: env.MAILER_EMAIL, pass: env.MAILER_PASSWORD },
});

transporter.verify().then(() => console.log('Listo para enviar correos'));
