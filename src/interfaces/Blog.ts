import type { Timestamp } from 'firebase/firestore';

export interface BlogPost {
	id: string; // Un identificador único para cada entrada, útil para referenciar entradas específicas
	title: string; // El título de la entrada de blog
	date: Timestamp; // La fecha de publicación de la entrada
	content: string; // El contenido de la entrada, que podría ser HTML, texto enriquecido, etc.
	author: string; // El autor de la entrada
	authorUrlImage: string; // La URL de la imagen del autor
	// Opcionales: podrías querer incluir más metadatos según tus necesidades
	// Por ejemplo, tags, comentarios, imagen destacada, etc.
	imageUrl: string; // URL de una imagen destacada para la entrada
	tags?: string[]; // Etiquetas o categorías para la entrada
	// comments?: Comment[]; // Un array de comentarios para la entrada
	viewCount?: number; // La cantidad de veces que la entrada ha sido vista
	shortDescription: string; // Una descripción corta de la entrada
	published: boolean; // Si la entrada está publicada o no
}

export interface Comment {
	id: string;
	author: string;
	date: Timestamp;
	content: string;
}
