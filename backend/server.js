import express, { json } from 'express';
import routes from './routes.js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(json());

// Configura CORS
app.use(
	cors({
		origin: 'http://localhost:4321', // Ajusta esto para que coincida con el origen de tu cliente
	}),
);

// Configuración para HTTPS
const key = fs.readFileSync(path.resolve(__dirname, '../creds/localhost-key.pem'));
const cert = fs.readFileSync(path.resolve(__dirname, '../creds/localhost.pem'));
const server = https.createServer({ key, cert }, app);

// Middleware para archivos estáticos
// eslint-disable-next-line import/no-named-as-default-member
app.use(express.static(path.join(__dirname, '../dist/server/entry.mjs')));

// Usar las rutas definidas en routes.js
app.use(routes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
