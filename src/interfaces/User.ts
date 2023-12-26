import type { DocumentReference } from 'firebase/firestore/lite';

/**
 * Represents a user.
 */
export interface User {
	/**
	 * The URL of the user's profile photo.
	 */
	urlFotoPerfil: string;
	/**
	 * The display name of the user.
	 */
	displayName: string;
	/**
	 * The age of the user (optional).
	 */
	age?: number | null;
	/**
	 * Additional details about the user.
	 */
	details: string;
	/**
	 * The email address of the user.
	 */
	email: string;
	/**
	 * The phone number of the user (optional).
	 */
	phone?: string | null;
	/**
	 * The team the user belongs to (optional).
	 */
	team?: DocumentReference | null;
	/**
	 * The unique identifier of the user.
	 */
	userId: string;
	/**
	 * The position of the user (optional).
	 */
	position?: string | null;
}
