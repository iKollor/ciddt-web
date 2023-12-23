import type { Url } from 'url';

export interface Equipo {
	nombre: string;
	edad?: number;
	detalles: string;
	urlFotoPerfil: Url;
	cargo: string;
}
