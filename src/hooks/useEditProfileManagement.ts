import { db, storage } from '@firebase/client';
import { doc, updateDoc } from '@firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from '@firebase/storage';
import { updateProfile, type User as FirebaseUser } from 'firebase/auth';
import { type DocumentReference, getDoc, setDoc } from 'firebase/firestore';
import { deleteObject } from 'firebase/storage';
import type { FilePreview } from 'src/interfaces/popUp';
import type { User } from 'src/interfaces/User';

export async function uploadProfilePicture(file: File, user: FirebaseUser | pseudoUser): Promise<boolean> {
	const storageRef = ref(storage, `users/${user.uid}/profilePicture`);
	console.log(user);

	try {
		const compressedImage = await compressImage(file);
		await uploadBytes(storageRef, compressedImage);
		await updateDoc(doc(db, 'users', user.uid), {
			urlFotoPerfil: await getDownloadURL(storageRef),
		});
		if ('email' in user) {
			console.log('updating profile');

			await updateProfile(user, {
				photoURL: await getDownloadURL(storageRef),
			});
		}
		return true;
	} catch (error: any) {
		throw new Error(error);
	}
}

export async function deleteProfilePicture(userId?: string, user?: FirebaseUser | pseudoUser): Promise<void> {
	if (userId == null && user == null) {
		throw new Error('Se debe especificar al menos el userId o el usuario');
	}

	const uid = user?.uid ?? userId;

	if (uid == null) {
		throw new Error('No se pudo obtener el ID del usuario');
	}

	const storageRef = ref(storage, `users/${uid}/profilePicture`);

	try {
		await deleteObject(storageRef);
		await updateDoc(doc(db, 'users', uid), {
			urlFotoPerfil: null,
		});
		if (user != null && 'email' in user) {
			await updateProfile(user, {
				photoURL: null,
			});
		}
	} catch (error: any) {
		throw new Error(error.message);
	}
}

export async function compressImage(file: File): Promise<Blob> {
	return await new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.src = url;
		img.onload = () => {
			const quality = 0.9; // Iniciar con una alta calidad
			const maxFileSize = 500 * 1024; // 500 KB

			const attemptCompression = (quality: number): void => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				canvas.width = img.naturalWidth;
				canvas.height = img.naturalHeight;
				ctx?.drawImage(img, 0, 0);

				canvas.toBlob(
					(blob) => {
						if (blob != null) {
							if (blob.size <= maxFileSize) {
								resolve(blob);
							} else if (quality > 0.1) {
								// Reducir la calidad en un 10% e intentar nuevamente
								attemptCompression(quality - 0.1);
							} else {
								// Si la calidad es <= 0.1 y todavía no cumple con el tamaño, se resuelve con el último blob intentado
								resolve(blob);
							}
						}
					},
					'image/jpeg', // Usar JPEG para compresión, suele ofrecer un mejor ratio tamaño/calidad que WEBP en algunas imágenes
					quality,
				);
			};

			attemptCompression(quality);
		};
		img.onerror = (error) => {
			reject(error);
		};
	});
}

export async function getProfilePicture(userId: string): Promise<string> {
	const storageRef = ref(storage, `users/${userId}/profilePicture`);
	try {
		const url = await getDownloadURL(storageRef);
		return url;
	} catch (error: any) {
		throw new Error(error);
	}
}

// TODO: edit user profile data in auth firebase and database firestore
export async function editProfileData(userId: string, userEditing: pseudoUser, authUser?: FirebaseUser): Promise<void> {
	const userRef = doc(db, 'users', userId);
	const userSnap = await getDoc(userRef);
	const user = userSnap.data() as User;

	console.log(userEditing);

	try {
		if (!userSnap.exists()) {
			throw new Error('El usuario no existe');
		}
		if (userEditing?.displayName != null && userEditing?.displayName !== user.displayName) {
			await updateDoc(userRef, {
				displayName: userEditing?.displayName,
			});
			if (userEditing.uid === userId && authUser != null) {
				await updateProfile(authUser, {
					displayName: userEditing?.displayName,
				});
			}
		}
		if (userEditing?.position != null && userEditing?.position !== user.position) {
			await updateDoc(userRef, {
				position: userEditing?.position,
			});
		}
		if (userEditing?.age != null && userEditing?.age !== user.age) {
			await updateDoc(userRef, {
				age: userEditing?.age,
			});
		}
		if (userEditing?.details != null && userEditing?.details !== user.details) {
			await updateDoc(userRef, {
				details: userEditing?.details,
			});
		}
		if (userEditing?.profilePicture?.file != null && userEditing != null) {
			await uploadProfilePicture(userEditing.profilePicture?.file, userEditing);
		}
	} catch (error: any) {
		throw new Error(error);
	}
}

export interface pseudoUser {
	uid: string;
	displayName: string;
	position?: string;
	age?: number;
	details?: string;
	profilePicture?: FilePreview | null;
	urlFotoPerfil?: string | null;
}

export async function createPseudoUserProfile(pseudoUser: pseudoUser): Promise<void> {
	// Genera un ID único con prefijo para el pseudo usuario

	const userRef: DocumentReference = doc(db, 'users', pseudoUser.uid);

	let profilePicture: FilePreview | null = null;

	try {
		if (pseudoUser.profilePicture == null) {
			profilePicture = await fetchPlaceholderAsFile();
		} else {
			profilePicture = pseudoUser.profilePicture;
		}
		if (profilePicture?.file == null) {
			throw new Error('Hubo un error al crear la imagen de perfil');
		}
		await setDoc(userRef, {
			uid: pseudoUser.uid,
			displayName: pseudoUser.displayName,
			position: pseudoUser.position,
			age: pseudoUser.age,
			details: pseudoUser.details,
			urlFotoPerfil: null,
		});
		await uploadProfilePicture(profilePicture.file, pseudoUser);
	} catch (error: any) {
		throw new Error(`Error al crear el perfil: ${error.message}`);
	}
}

export async function fetchPlaceholderAsFile(): Promise<FilePreview | null> {
	try {
		const response = await fetch('/assets/images/profile_placeholder.jpg');
		const blob = await response.blob();
		const file = new File([blob], 'profile_placeholder.jpg', { type: blob.type });
		const previewUrl = URL.createObjectURL(file);

		return {
			file,
			previewUrl,
		};
	} catch (error) {
		console.error('Error fetching placeholder file:', error);
		return null;
	}
}
