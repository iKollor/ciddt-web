import { faClose, faExternalLink, faInfoCircle, faPencil } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// eslint-disable-next-line import/no-unresolved
import { navigate } from 'astro:transitions/client';
// eslint-disable-next-line import/no-unresolved
import { Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import React, { type FC, useEffect, useRef, useState } from 'react';
import { deletePost, getPosts } from 'src/hooks/blogPostService';
import { loader } from 'src/hooks/pushBody';
import type { BlogPost } from 'src/interfaces/Blog';

import ImageLoader from './ImageLoader';
import Tooltip from './Tooltip';

const BlogTable: FC = () => {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [postFetched, setPostFetched] = useState(false);
	const tableRef = useRef<HTMLDivElement>(null);
	const [verMas, setVerMas] = useState(true);

	const fetchBlogPosts = async (): Promise<BlogPost[] | null> => {
		loader.set({
			isLoading: true,
			message: 'Obteniendo posts...',
			type: 'infinite',
		});
		try {
			return await getPosts();
		} catch (error: any) {
			console.log(error);
			return null;
		} finally {
			loader.set({
				isLoading: false,
				type: 'infinite',
			});
		}
	};

	useEffect(() => {
		if (!postFetched) {
			fetchBlogPosts()
				.then((blogPosts) => {
					if (blogPosts != null) {
						setPosts(blogPosts);
						setPostFetched(true);
					}
				})
				.catch((error) => {
					console.log(error);
				});
		}
	}, [postFetched]);

	const handleDeletePost = async (id: string): Promise<void> => {
		try {
			await deletePost(id);
		} catch (error: any) {
			console.error('Error al eliminar el post', error);
		}
	};

	return (
		<>
			<div className="flex flex-col gap-y-2 justify-center items-end">
				<div className="flex gap-2">
					<a
						href="/ciddt-admin/content-manager/post/new-post"
						className="bg-edgewater-600 p-2 rounded-md hover:bg-edgewater-500 transition-all duration-200 ease-in-out px-3"
						data-astro-reload
					>
						Añadir nuevo post
					</a>
				</div>
			</div>
			<motion.div
				ref={tableRef}
				initial={{
					maxHeight: 460,
				}}
				animate={{
					maxHeight: verMas ? 460 : 880,
				}}
				className="flex flex-auto flex-col items-center mt-8 justify-start w-full"
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
								<th className="pb-2 text-start min-w-[80px] uppercase">Titulo</th>
								<th className="pb-2 pl-6 text-start w-[130px] uppercase">Creado en</th>
								<th className="pb-2 text-start min-w-[50px] uppercase">Autor</th>
								<th className="pb-2 text-start min-w-[120px] uppercase">Descripción</th>
								<th className="pb-2 text-center min-w-[50px] uppercase">Vistas</th>
								<th className="pb-2 text-start min-w-[80px] uppercase">Estado</th>
								<th className="pb-2 text-end min-w-[50px] uppercase">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{posts?.map((post: BlogPost, idx: number) => (
								<tr
									key={idx}
									className="border-b border-solid last:border-b-0 border-white border-opacity-20 hover:bg-edgewater-700 cursor-pointer transition-all duration-150 ease-in-out"
								>
									<td className="p-3 rounded-tl-md rounded-bl-md max-w-[60px]">
										<div className="flex items-center">
											<div className="relative inline-block shrink-0">
												<ImageLoader
													src={post.imageUrl ?? '/assets/images/default_placeholder.png'}
													width={50}
													height={50}
													className="max-w-[50px] max-h-[50px] w-auto h-auto inline-block shrink-0 rounded-md object-cover"
													type="image"
												></ImageLoader>
											</div>
										</div>
									</td>
									<td id="title" className="max-w-[120px] truncate" title={post.title}>
										{post.title}
									</td>
									<td id="date" className="capitalize pl-6">
										{new Timestamp(post.date.seconds, post.date.nanoseconds)
											.toDate()
											.toLocaleDateString()}
									</td>
									<td id="author" className="capitalize w-[100px]">
										{post.author}
									</td>

									<td id="description" className="max-w-[120px] truncate">
										<Tooltip
											content={post.shortDescription}
											children={<p className="truncate text-ellipsis">{post.shortDescription}</p>}
										/>
									</td>
									<td id="views" className="text-center">
										{post.viewCount ?? 0}
									</td>
									<td className="capitalize w-[80px]" id="estate">
										{post.published ? 'Publicado' : 'Borrador'}
									</td>
									<td id="action" className="rounded-br-md rounded-tr-md">
										<div className="flex items-center gap-2 w-full justify-end pr-1">
											{post.published && (
												<button
													type="button"
													className="text-white text-opacity-50 hover:text-opacity-100 flex items-center justify-center"
													onClick={() => {
														window.open(`/blog/${post.id}`, '_blank');
													}}
												>
													<FontAwesomeIcon icon={faExternalLink} className="w-4 h-4" />
												</button>
											)}
											<button
												className="text-white text-opacity-50 hover:text-opacity-100 flex items-center justify-center"
												onClick={(e) => {
													e.stopPropagation();
													window.location.href = `/ciddt-admin/content-manager/post/${post.id}`;
												}}
												data-astro-reload
											>
												<FontAwesomeIcon icon={faPencil} className="w-4 h-4" />
											</button>
											<button
												type="button"
												className="text-white text-opacity-50 hover:text-opacity-100 flex items-center justify-center"
												onClick={() => {
													if (confirm('¿Estás seguro que quieres eliminar este post?')) {
														// Eliminar post
														void handleDeletePost(post.id);
														void navigate('/ciddt-admin/content-manager/');
													}
												}}
											>
												<FontAwesomeIcon icon={faClose} className="w-5 h-5" />
											</button>
										</div>
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

export default BlogTable;
