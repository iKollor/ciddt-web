export interface Post {
	provider: string;
	mediaType: 'album' | 'video' | 'photo'; // Nuevo campo para especificar el tipo de medio
	media: string; // Contiene la URL o el nombre del archivo del medio
	details: string;
	likesCount: number;
	url: string;
	timestamp: Date; // Fecha y hora de la publicación
	id: string;
	page: string;
}
