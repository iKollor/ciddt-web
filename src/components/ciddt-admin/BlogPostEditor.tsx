/* eslint-disable import/no-named-as-default */
import { faEdit, faEye } from '@fortawesome/free-regular-svg-icons';
import { faAdd, faInfoCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Document from '@tiptap/extension-document';
import Dropcursor from '@tiptap/extension-dropcursor';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import Paragraph from '@tiptap/extension-paragraph';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import { mergeAttributes, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
// eslint-disable-next-line import/no-unresolved
import { navigate } from 'astro:transitions/client';
import { Timestamp } from 'firebase/firestore';
import type { UserRecord } from 'firebase-admin/auth';
import lodash from 'lodash';
import React, { type FC, useEffect, useState } from 'react';
import { popupStore } from 'src/hooks/popupStores';
import { loader } from 'src/hooks/pushBody';
import type { BlogPost } from 'src/interfaces/Blog';
import ImageResize from 'tiptap-extension-resize-image';

import { deletePost, savePost, titleToId } from '../../hooks/blogPostService';
import FileUploader from './FileUploader';
import ImageLoader from './ImageLoader';
import { requestUserInput } from './InputPopup';
import Tiptap from './Tiptap';
import Tooltip from './Tooltip';

interface BlogPostEditorProps {
	userRecord?: UserRecord;
	blogPost?: BlogPost;
}

const BlogPostEditor: FC<BlogPostEditorProps> = ({ userRecord, blogPost }) => {
	// Si no se proporciona un post, usa un post por defecto
	const defaultPost: BlogPost = {
		id: '',
		title: '',
		content: '',
		author: userRecord?.displayName ?? '',
		date: Timestamp.fromDate(new Date()),
		shortDescription: '',
		published: false,
		imageUrl: '',
		authorUrlImage: userRecord?.photoURL ?? '',
	};

	const initialPost = blogPost ?? defaultPost;
	const [post, setPost] = useState<BlogPost>(initialPost);

	const [isFocused, setIsFocused] = useState(false);

	// Estado para rastrear si el post ha sido editado
	const [isEdited, setIsEdited] = useState(false);

	const isNewPost = blogPost == null;

	useEffect(() => {
		// Comprueba si el post ha sido editado

		const a = lodash.omit(post, ['date']);
		const b = lodash.omit(defaultPost, ['date']);

		const postChanged =
			!lodash.isEqual(a, b) &&
			post.title !== '' &&
			post.shortDescription !== '' &&
			post.imageUrl !== '' &&
			post.content !== '' &&
			post.imageUrl !== undefined &&
			post.content !== '<p></p>' &&
			post.content !== '<p><br></p>';
		setIsEdited(postChanged);
	}, [post, initialPost]);

	const extensions = [
		TextStyle.configure({
			HTMLAttributes: {
				class: 'text-black dark:text-white',
			},
		}),
		StarterKit.configure({
			bulletList: {
				keepMarks: true,
				keepAttributes: false,
				HTMLAttributes: {
					class: 'list-disc',
				},
			},
			orderedList: {
				keepMarks: true,
				keepAttributes: false,
				HTMLAttributes: {
					class: 'list-decimal',
				},
			},
			blockquote: {
				HTMLAttributes: {
					class: 'pl-4 border-l-2 border-black border-opacity-50 dark:border-white',
				},
			},
			horizontalRule: {
				HTMLAttributes: {
					class: 'my-8 border-t-2 border-black border-opacity-50 dark:border-white hr-hidden',
					'data-scroll-class': 'hr-show',
					'data-scroll-repeat': true,
					'data-scroll': true,
					'data-scroll-offset': '25%, 0',
				},
			},
		}),
		TextAlign.configure({
			types: ['heading', 'paragraph'],
		}),
		Heading.extend({
			levels: [1, 2, 3, 4, 5],
			renderHTML({ node, HTMLAttributes }) {
				const level: number = this.options.levels.includes(node.attrs.level)
					? node.attrs.level
					: this.options.levels[0];
				const classes: Record<number, string> = {
					1: 'text-4xl',
					2: 'text-3xl',
					3: 'text-2xl',
					4: 'text-xl',
					5: 'text-lg',
				};
				return [
					`h${level}`,
					mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
						class: `${classes[level]}`,
					}),
					0,
				];
			},
		}).configure({
			levels: [1, 2, 3, 4, 5],
			HTMLAttributes: {
				class: 'fade-in-up',
				'data-scroll-class': 'fade-in-up-active',
				'data-scroll-repeat': true,
				'data-scroll': true,
				'data-scroll-offset': '25%, 0',
			},
		}),
		Paragraph.configure({
			HTMLAttributes: {
				class: 'my-4 text-base fade-in-up',
				'data-scroll-class': 'fade-in-up-active',
				'data-scroll-repeat': true,
				'data-scroll': true,
				'data-scroll-offset': '25%, 0',
			},
		}),
		Dropcursor,
		Document,
		ImageResize.configure({
			HTMLAttributes: {
				class: 'w-full bg-white fade-in-up content-image',
				'data-scroll-class': 'fade-in-up-active',
				'data-scroll-repeat': true,
				'data-scroll': true,
				'data-scroll-offset': '25%, 0',
			},
		}),
		Link.configure({
			HTMLAttributes: {
				class: 'text-red-500 hover:underline cursor-pointer',
			},
		}),
	];

	const editor = useEditor({
		content: post.content,
		extensions,
		editorProps: {
			attributes: {
				class: 'focus:outline-none px-4 py-8 dark',
			},
		},
		onFocus: () => {
			setIsFocused(true);
		},
		onBlur: () => {
			setIsFocused(false);
		},
		onUpdate: ({ editor }) => {
			setPost({ ...post, content: editor.getHTML() });
		},
	});

	async function handleEditTitle(): Promise<void> {
		const title = await requestUserInput(
			'text',
			'Nuevo Título',
			'Ingrese un título para la publicación',
			'Título inválido',
			post.title,
		);
		const id = `${titleToId(title)}-${Date.now()}`;
		setPost({ ...post, title });
		history.replaceState(null, '', `/ciddt-admin/content-manager/post/${id}`);
	}

	async function handleEditDescription(): Promise<void> {
		const shortDescription = await requestUserInput(
			'text',
			'Nueva Descripción',
			'Ingrese una descripción para la publicación',
			'Descripción inválida',
			post.shortDescription,
		);
		setPost({ ...post, shortDescription });
	}

	async function handleEditAuthor(): Promise<void> {
		const author = await requestUserInput(
			'text',
			'Nuevo Autor',
			'Ingrese el nombre del autor de la publicación',
			'Autor inválido',
			post.author,
		);
		setPost({ ...post, author });
	}

	async function handlePublish(): Promise<void> {
		try {
			loader.set({
				isLoading: true,
				type: 'infinite',
			});
			await savePost({ ...post, published: true });
			await navigate('/ciddt-admin/content-manager/');
		} catch (error: any) {
			console.error('Error al publicar el post', error);
		} finally {
			loader.set({
				isLoading: false,
				type: 'infinite',
			});
		}
	}

	async function handleUnpublish(): Promise<void> {
		try {
			loader.set({
				isLoading: true,
				type: 'infinite',
			});
			await savePost({ ...post, published: false });
			await navigate('/ciddt-admin/content-manager/');
		} catch (error: any) {
			console.error('Error al despublicar el post', error);
		} finally {
			loader.set({
				isLoading: false,
				type: 'infinite',
			});
		}
	}

	async function handleSaveDraft(): Promise<void> {
		try {
			loader.set({
				isLoading: true,
				type: 'infinite',
			});
			if (editor == null) {
				console.error('El editor no está disponible');
				return;
			}

			await savePost({ ...post, content: editor.getHTML() });

			await navigate('/ciddt-admin/content-manager/');
		} catch (error: any) {
			console.error('Error al guardar el borrador', error);
		} finally {
			loader.set({
				isLoading: false,
				type: 'infinite',
			});
		}
	}

	async function handleDeletePost(): Promise<void> {
		try {
			loader.set({
				isLoading: true,
				type: 'infinite',
			});
			await deletePost(post.id);
			await navigate('/ciddt-admin/content-manager/');
		} catch (error) {
			console.error('Error al eliminar el post', error);
		} finally {
			loader.set({
				isLoading: false,
				type: 'infinite',
			});
		}
	}

	const dateValue = new Timestamp(post?.date.seconds, post?.date.nanoseconds).toDate().toISOString().split('T')[0];

	function noChangesPopUp(): void {
		popupStore.set({
			type: 'danger',
			message: 'Debes llenar toda la información del post antes de publicarlo',
			title: 'No hay cambios',
			visible: true,
		});
	}

	async function handleAddTag(): Promise<void> {
		let tag = await requestUserInput(
			'text',
			'Nueva Etiqueta',
			'Ingrese una etiqueta para la publicación',
			'Etiqueta inválida',
			'',
		);
		if (tag === '') {
			return;
		}
		// if tag in tags return
		if (post.tags?.includes(tag) ?? false) {
			return;
		}

		if (tag.startsWith('#')) {
			tag = tag.slice(1);
		}

		setPost({ ...post, tags: [...(post.tags ?? []), tag] });
	}

	return (
		<>
			<div className="fixed bottom-0 flex gap-6 px-4 py-6 rounded-xl opacity-50 hover:opacity-100 transition-all ease-in-out duration-300 z-50">
				<button
					className={`${initialPost.published ? `bg-blue-500 hover:bg-blue-600` : `bg-green-500 hover:bg-green-600`} text-white px-4 py-2 rounded-md  transition-all duration-150 ease-in-out`}
					type="button"
					onClick={() => {
						if (!isEdited) {
							noChangesPopUp();
							return;
						}
						if (initialPost.published) {
							void handleUnpublish();
						} else {
							if (confirm('¿Estás seguro que quieres publicar este post?')) {
								void handlePublish();
							}
						}
					}}
				>
					{initialPost.published ? 'Despublicar' : 'Publicar'}
				</button>
				<button
					className="bg-edgewater-700 text-white px-4 py-2 rounded-md hover:bg-edgewater-800 transition-all duration-150 ease-in-out"
					type="button"
					onClick={() => {
						if (!isEdited) {
							noChangesPopUp();
							return;
						}
						void handleSaveDraft();
					}}
				>
					{initialPost.published ? 'Guardar Cambios' : 'Guardar Borrador'}
				</button>
				{!isNewPost && (
					<button
						type="button"
						className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all duration-150 ease-in-out"
						onClick={() => {
							if (isNewPost) {
								return;
							}
							if (confirm('¿Estás seguro que quieres eliminar este post?')) {
								// Eliminar post
								void handleDeletePost();
							}
						}}
					>
						Eliminar
					</button>
				)}
			</div>
			<section className="space-y-5 w-full">
				<button
					className="bg-edgewater-500 text-white px-4 py-2 rounded-md hover:bg-edgewater-400 transition-all duration-150 ease-in-out"
					onClick={() => {
						if (!isEdited) {
							noChangesPopUp();
							return;
						}
						void navigate(`/ciddt-admin/content-manager/post/preview/${post?.id}`);
					}}
				>
					Previsualizar
					<FontAwesomeIcon icon={faEye} className="ml-4" />
				</button>
				<div>
					<h1 className="text-opacity-50 text-white font-bold text-2xl">Ruta del post</h1>
					<div className="flex gap-4 items-center">
						<a
							href={`/blog/${post?.id}`}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-edgewater-300"
						>
							/blog/{post?.id}
						</a>
					</div>
				</div>
				<div className="w-full bg-edgewater-800 p-4 rounded-xl">
					<div className="flex gap-4 items-center">
						<h1 className="text-opacity-50 text-white font-bold text-2xl">Título *</h1>
						<button
							type="button"
							onClick={() => {
								void handleEditTitle();
							}}
							className=" text-white text-opacity-50 hover:text-opacity-100"
						>
							<FontAwesomeIcon icon={faEdit} />
						</button>
					</div>
					<h1 className="font-black text-4xl">{post?.title}</h1>
				</div>
				<div className="w-full bg-edgewater-800 p-4 rounded-xl">
					<div className="flex gap-4 items-center">
						<h1 className="text-opacity-50 text-white font-bold text-2xl">Descripción Corta *</h1>
						<button
							type="button"
							onClick={() => {
								void handleEditDescription();
							}}
							className=" text-white text-opacity-50 hover:text-opacity-100"
						>
							<FontAwesomeIcon icon={faEdit} />
						</button>
					</div>
					<h3>{post?.shortDescription}</h3>
				</div>
				<div className="w-full bg-edgewater-800 p-4 rounded-xl">
					<h1 className="text-opacity-50 text-white font-bold text-2xl">Fecha de publicación</h1>
					<div className="flex gap-4 items-center">
						<input
							type="date"
							aria-label="fecha de publicación"
							className="p-2 rounded-md mt-2 bg-edgewater-700 cursor-pointer"
							value={dateValue}
							onChange={(e) => {
								setPost({ ...post, date: Timestamp.fromDate(new Date(e.target.value)) });
							}}
							max={new Date().toISOString().split('T')[0]}
						/>
					</div>
				</div>
				<div className="w-full bg-edgewater-800 p-4 rounded-xl">
					<h1 className="text-opacity-50 text-white font-bold text-2xl">Imagen de cabecera *</h1>
					<div className="flex gap-4 items-start mt-3 flex-col">
						<ImageLoader
							width={200}
							height={200}
							src={post.imageUrl === '' ? undefined : post.imageUrl}
							type="image"
							className="rounded-lg"
						/>
						<FileUploader
							userRecord={userRecord}
							type="picker"
							buttonText="Selecciona una imagen"
							onFileSelected={(file) => {
								setPost({ ...post, imageUrl: file.url });
							}}
						/>
					</div>
				</div>
				<div className="w-full bg-edgewater-800 p-4 rounded-xl">
					<h1 className="text-opacity-50 text-white font-bold text-2xl">Autor del Post</h1>
					<div className="flex gap-4 items-center mt-3">
						<ImageLoader
							width={100}
							height={100}
							src={post.authorUrlImage}
							type="image"
							circle
							className="rounded-full w-16 h-16 object-cover"
						/>
						<FileUploader
							userRecord={userRecord}
							type="picker"
							buttonText="Cambiar imagen del autor"
							onFileSelected={(file) => {
								setPost({ ...post, authorUrlImage: file.url });
							}}
						/>
					</div>
					<div className="flex gap-2 mt-4">
						<h3 className="font-black text-2xl">{post.author}</h3>
						<button
							type="button"
							onClick={() => {
								void handleEditAuthor();
							}}
							className=" text-white text-opacity-50 hover:text-opacity-100"
						>
							<FontAwesomeIcon icon={faEdit} />
						</button>
					</div>
				</div>
				<div className="w-full bg-edgewater-800 p-4 rounded-xl">
					<div className="flex items-center gap-2 mb-4">
						<h1 className="text-opacity-50 text-white font-bold text-2xl">Tags</h1>
						<Tooltip content="Las etiquetas sirven para que el usuario pueda diferenciar el tema del post">
							<FontAwesomeIcon icon={faInfoCircle} className="text-opacity-50 text-white" />
						</Tooltip>
					</div>
					<div className="flex gap-4 flex-wrap">
						{post.tags?.map((tag) => (
							<div
								key={tag}
								className="bg-edgewater-700 text-white px-2 py-1 rounded-md flex items-center justify-center cursor-pointer"
							>
								<p className="line-clamp-1">{tag.startsWith('#') ? tag : '#' + tag}</p>
								<FontAwesomeIcon
									icon={faTrash}
									className="ml-4 hover:text-red-500"
									onClick={() => {
										setPost({ ...post, tags: post.tags?.filter((t) => t !== tag) });
									}}
								/>
							</div>
						))}
						<button
							type="button"
							className="bg-edgewater-500 text-white px-4 py-2 rounded-md hover:bg-edgewater-400 transition-all duration-150 ease-in-out"
							onClick={() => {
								void handleAddTag();
							}}
						>
							<Tooltip content="Añadir etiqueta">
								<FontAwesomeIcon icon={faAdd} />
							</Tooltip>
						</button>
					</div>
				</div>
				<div>
					<Tiptap editor={editor} userRecord={userRecord} isFocused={isFocused} />
				</div>
			</section>
		</>
	);
};

export default BlogPostEditor;
