import express, { json } from 'express';
import dotenv from 'dotenv';
import routes from './routes.js';

dotenv.config();

const app = express();
app.use(json());

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, '../../../')));

// Usar las rutas definidas en routes.js
app.use(routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
