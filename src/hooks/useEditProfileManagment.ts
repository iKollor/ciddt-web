import { db, storage } from '@firebase/client';
import { ref, uploadBytes } from '@firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL } from 'firebase/storage';

export async function uploadProfilePicture(file: File, userId: string): Promise<boolean> {
	const storageRef = ref(storage, `users/${userId}/profilePicture`);
	try {
		await uploadBytes(storageRef, file);
		await updateDoc(doc(db, 'users', userId), {
			urlFotoPerfil: await getDownloadURL(storageRef),
		});
		return true;
	} catch (error: any) {
		throw new Error(error);
	}
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
