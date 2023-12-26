import { db, storage } from '@firebase/client';
import { doc, updateDoc } from '@firebase/firestore/lite';
import { getDownloadURL, ref, uploadBytes } from '@firebase/storage';
import { updateProfile, type User } from 'firebase/auth';

export async function uploadProfilePicture(file: File, user: User): Promise<boolean> {
	const storageRef = ref(storage, `users/${user.uid}/profilePicture`);

	try {
		const compressedImage = await compressImage(file);
		await uploadBytes(storageRef, compressedImage);
		await updateDoc(doc(db, 'users', user.uid), {
			urlFotoPerfil: await getDownloadURL(storageRef),
		});
		await updateProfile(user, {
			photoURL: await getDownloadURL(storageRef),
		});
		return true;
	} catch (error: any) {
		throw new Error(error);
	}
}

export async function compressImage(file: File): Promise<Blob> {
	return await new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.src = url;
		img.onload = function () {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;

			ctx?.drawImage(img, 0, 0);

			canvas.toBlob(
				(blob) => {
					if (blob != null) {
						resolve(blob);
					} else {
						reject(new Error('Error al comprimir la imagen'));
					}
				},
				'image/webp',
				0.5,
			);
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
