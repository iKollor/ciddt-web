export interface Post {
	title: string;
	provider: string;
	mediaType: 'image' | 'video'; // Nuevo campo para especificar el tipo de medio
	media: string; // Contiene la URL o el nombre del archivo del medio
	details: string;
	likesCount: number;
	url: string;
	timestamp: Date; // Fecha y hora de la publicación
}
