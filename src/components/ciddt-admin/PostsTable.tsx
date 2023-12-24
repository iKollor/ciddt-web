import { db } from '@firebase/client';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// eslint-disable-next-line import/no-unresolved
// import { navigate } from 'astro:transitions/client';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import type { UserRecord } from 'firebase-admin/auth';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { popupStore } from 'src/hooks/popupStores';
import { loader } from 'src/hooks/pushBody';
import { FetchError } from 'src/interfaces/Error';
import type { Post, provider } from 'src/interfaces/Post';
import type { UserPage } from 'src/interfaces/UserPages';

import Tooltip from './Tooltip';

interface Props {
	pagePosts?: Post[] | null;
	userRecord: UserRecord | null;
	provider: provider;
}

const serverUrl = import.meta.env.PUBLIC_SERVER_URL;

const PostsTable: React.FC<Props> = ({ pagePosts, userRecord, provider }) => {
	const [verMas, setVerMas] = useState(true);
	const [posts, setPosts] = useState(pagePosts);
	// const $pages = useStore(pageListStore);
	const tableRef = useRef<HTMLDivElement>(null);
	const [pageId, setPageId] = useState<string | null>(null);
	const selectUserPages = useRef<HTMLSelectElement>(null);
	const [pages, setPages] = useState<UserPage[]>([]);
	const [postFetched, setPostFetched] = useState(false);

	const formatProvider = provider.charAt(0).toUpperCase() + provider.slice(1);

	async function getUserPages(): Promise<void> {
		if (userRecord == null) return;
		const userRef = doc(db, 'users', userRecord.uid, 'providers', 'facebook');
		const querySnapshot = await getDoc(userRef);

		const userPages: UserPage[] = [];
		// pages in firebase are store as an array object
		if (querySnapshot.data()?.pages != null) {
			querySnapshot.data()?.pages.forEach((page: any) => {
				userPages.push(page);
			});
		}
		setPages(userPages);
	}

	const getPosts = async (pageId: string): Promise<Post[] | null> => {
		if (userRecord != null && !postFetched) {
			loader.set({
				isLoading: true,
				message: 'Obteniendo posts...',
				type: 'infinite',
			});
			try {
				const fbPostsRef = collection(db, 'posts', userRecord.uid, provider);
				const fbPostsSnapshot = await getDocs(fbPostsRef);
				if (!fbPostsSnapshot.empty) {
					const posts = fbPostsSnapshot.docs
						.filter((doc) => doc.id.includes(pageId)) // Filtrar los documentos por ID
						.map((doc) => doc.data() as Post);
					return posts.length > 0 ? posts : null;
				} else {
					return null;
				}
			} catch (error: any) {
				console.log(error);
				return null;
			} finally {
				loader.set({
					isLoading: false,
					type: 'infinite',
				});
			}
		} else {
			return null;
		}
	};

	const savePosts = async (pageId: string): Promise<void> => {
		const firebasePosts = await getPosts(pageId);
		setPosts(firebasePosts);
	};

	useEffect(() => {
		void getUserPages();
	}, []);

	useEffect(() => {
		if (posts == null && pageId != null) {
			void savePosts(pageId);
		}
	}, [posts, pageId]);

	const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
		const newPageId = e.target.value;
		if (newPageId !== 'default') {
			setPageId(newPageId);
			void savePosts(newPageId);
		}
	};

	const handleClick = async (): Promise<void> => {
		const pageId = selectUserPages?.current?.value;
		if (!pages?.some((page) => page.id === pageId)) {
			popupStore.set({
				title: 'Error',
				message: 'Selecciona una página',
				type: 'danger',
				visible: true,
			});
			return;
		}
		try {
			loader.set({
				isLoading: true,
				message: 'Iniciando...',
				type: 'progress',
				progress: 0,
			});
			const body = {
				userId: userRecord?.uid,
				pageToken: pages?.find((page) => page.id === pageId)?.accessToken ?? '',
				pageId,
			};
			loader.set({ ...loader.get(), progress: 90, message: 'Enviando solicitud...' });

			const result = await fetch(`${serverUrl}/${provider}/fetchPosts/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});

			if (!result.ok) {
				throw new FetchError(result.status, result.statusText, `Error fetching ${formatProvider} posts`);
			} else {
				setPostFetched(true);
				loader.set({ ...loader.get(), progress: 100, message: 'Finalizado' });
				popupStore.set({
					title: 'Posts actualizados',
					message: `Se han actualizado los posts de la página ${selectUserPages?.current?.options[
						selectUserPages?.current?.selectedIndex
					].text}`,
					type: 'success',
					visible: true,
				});
			}
		} catch (error: any) {
			console.error(error);
			const errorMessage =
				error.status === 404
					? 'Hubo un error al intentar conectarse con el servidor, '
					: error.status === 429
						? 'Demasiadas solicitudes, intenta más tarde'
						: error.message; // o puedes usar un mensaje genérico basado en el código de estado

			setPostFetched(false);

			popupStore.set({
				title: 'Error',
				message: `Ha ocurrido un error: ${errorMessage ?? error}`,
				type: 'danger',
				visible: true,
			});

			loader.set({
				isLoading: false,
				type: 'progress',
			});
		} finally {
			loader.set({
				isLoading: false,
				type: 'progress',
			});
			if (pageId != null) {
				void savePosts(pageId);
			}
		}
	};

	return (
		<>
			<div className="flex flex-col gap-y-2 justify-center items-end">
				<div className="flex items-center justify-center">
					{pages?.some((page) => page.id === pageId) && (
						<picture>
							<img
								src={pages?.find((page) => page.id === pageId)?.picture ?? ''}
								alt="Profile Page Picture"
								className="w-[30px] h-[30px] rounded-full mr-2"
							/>
						</picture>
					)}
					<select
						ref={selectUserPages}
						onChange={handleSelectChange}
						aria-label="Selecciona una página"
						id="select_userpages"
						className="p-2 rounded-md cursor-pointer max-w-[200px]"
					>
						<option value="default">Selecciona una página</option>
						{pages
							?.filter((page) => page.account_type === provider)
							.map((page) => (
								<option key={page.id} value={page.id}>
									{provider === 'instagram' ? '@' + page.name : page.name}
								</option>
							))}
					</select>
				</div>
				<button
					onClick={() => {
						void handleClick();
					}}
					className="bg-edgewater-600 p-2 rounded-md hover:bg-edgewater-500 transition-all duration-200 ease-in-out px-3"
				>
					{posts == null ? 'Añadir posts' : 'Actualizar posts'}
				</button>
			</div>
			<motion.div
				ref={tableRef}
				initial={{
					maxHeight: 460,
				}}
				animate={{
					maxHeight: verMas ? 460 : 850,
				}}
				className="flex flex-auto flex-col items-center mt-8 justify-start"
			>
				<div className="overflow-x-auto w-full overflow-y-hidden">
					<table className="w-full my-0 align-middle border-neutral-200">
						<thead className="align-bottom">
							<tr className="font-semibold text-sm text-white text-opacity-50">
								<th className="pb-2 text-start min-w-[60px] uppercase flex flex-row justify-start overflow-visible">
									<Tooltip
										content="Si las imágenes no llegan a cargar, trata de actualizar los posts"
										children={
											<FontAwesomeIcon
												icon={faInfoCircle}
												className="mr-2 w-3 h-3 hover:text-opacity-100 transition-all duration-150 ease-in-out"
											/>
										}
									/>
									Post
								</th>
								<th className="pb-2 text-start min-w-[80px] uppercase">Página</th>
								<th className="pb-2 pl-6 text-start w-[130px] uppercase">Proveedor</th>
								<th className="pb-2 text-start min-w-[50px] uppercase">Tipo</th>
								<th className="pb-2 text-center min-w-[50px] uppercase">Likes</th>
								<th className="pb-2 text-start min-w-[120px] uppercase">Descripción</th>
								<th className="pb-2 pl-6 text-start min-w-[80px] uppercase">Creado en</th>
							</tr>
						</thead>
						<tbody>
							{posts?.map((post: Post, idx: number) => (
								<tr
									key={idx}
									className="border-b border-solid last:border-b-0 border-white border-opacity-20 hover:bg-edgewater-700 cursor-pointer transition-all duration-150 ease-in-out"
									onClick={() => window.open(post.url, '_blank')}
								>
									<td className="p-3 rounded-tl-md rounded-bl-md max-w-[60px]">
										<div className="flex items-center">
											<div className="relative inline-block shrink-0">
												{post.mediaType === 'album' || post.mediaType === 'photo' ? (
													<img
														src={
															post.media ??
															'https://placehold.co/50x50?text=No+image&font=ptsans'
														}
														width={50}
														height={50}
														className="w-[50px] h-[50px] inline-block shrink-0 rounded-md"
														alt="post image preview"
													/>
												) : (
													<video
														src={post.media}
														width={50}
														height={50}
														className="w-[50px] h-[50px] inline-block shrink-0 rounded-md"
														autoPlay
														muted
														loop
													></video>
												)}
											</div>
										</div>
									</td>
									<td id="page" className="max-w-[120px] truncate" title={post.page}>
										{post.page}
									</td>
									<td id="provider" className="capitalize pl-6">
										{post.provider}
									</td>
									<td id="mediaType" className="capitalize w-[50px]">
										{post.mediaType}
									</td>
									<td id="likes" className="text-center">
										{post.likesCount}
									</td>
									<td id="details" className="max-w-[120px] truncate">
										<Tooltip
											content={post.details}
											children={<p className="truncate text-ellipsis">{post.details}</p>}
										/>
									</td>
									<td id="date" className="rounded-tr-md rounded-br-md pl-6">
										{new Date(post.timestamp).toLocaleDateString('es', {
											day: '2-digit',
											month: '2-digit',
											year: 'numeric',
										})}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				{posts == null ? (
					<div className="flex flex-col items-center justify-center w-full h-full mt-4">
						<h1 className="text-xl text-white text-opacity-50">No hay posts</h1>
					</div>
				) : posts.length > 5 ? (
					<button
						className="capitalize py-2 px-4 bg-edgewater-700 hover:bg-edgewater-600 transition-all duration-150 ease-in-out rounded-md mt-4"
						onClick={() => {
							setVerMas(!verMas);
						}}
					>
						{verMas ? 'Ver más' : 'Ver menos'}
					</button>
				) : null}
			</motion.div>
		</>
	);
};

export default PostsTable;
