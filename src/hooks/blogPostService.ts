import { db } from '@firebase/client';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import type { BlogPost } from 'src/interfaces/Blog';

export const teamId = import.meta.env.PUBLIC_TEAM_ID;

export async function getPostById(id: string): Promise<BlogPost | null> {
	const blogPostRef = doc(db, 'teams', teamId, 'blog posts', id);
	const blogPostSnapshot = await getDoc(blogPostRef);

	if (!blogPostSnapshot.exists()) {
		return null;
	}

	return { ...(blogPostSnapshot.data() as BlogPost), id };
}
export function titleToId(titulo: string): string {
	// Normalizar el título para remover acentos y caracteres especiales
	const normalized = titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

	// Convertir espacios en guiones y remover caracteres especiales que no sean letras o números
	const id = normalized
		// Reemplazar espacios con guiones
		.replace(/\s+/g, '-')
		// Remover todos los caracteres excepto letras, números y guiones
		.replace(/[^a-zA-Z0-9-]/g, '')
		// Convertir a minúsculas para la uniformidad de la URL
		.toLowerCase()
		// remover guiones al principio y al final y duplicados
		.replace(/^-+|-+$/g, '')
		// limitar la longitud de la URL a 50 caracteres
		.slice(0, 50);

	return id;
}

export async function savePost(post: BlogPost): Promise<void> {
	if (post.id == null || post.id === '' || post.id === undefined || post.id === 'new-post') {
		post.id = `${titleToId(post.title)}-${Date.now()}`;
		console.log('post id null, creating new post id: ', post.id);
	}
	const blogPostRef = doc(db, 'teams', teamId, 'blog posts', post.id);
	await setDoc(blogPostRef, post, { merge: true });
}

export async function deletePost(id: string): Promise<void> {
	const blogPostRef = doc(db, 'teams', teamId, 'blog posts', id);
	await deleteDoc(blogPostRef);
}

export async function getPosts(): Promise<BlogPost[]> {
	const blogPostsRef = collection(db, 'teams', teamId, 'blog posts');
	const blogPostsSnapshot = await getDocs(blogPostsRef);

	if (blogPostsSnapshot.empty) {
		return [];
	}

	return blogPostsSnapshot.docs.map((doc) => {
		const data = doc.data() as BlogPost;
		const blogPost: BlogPost = {
			...data,
			id: doc.id,
		};
		return blogPost;
	});
}
