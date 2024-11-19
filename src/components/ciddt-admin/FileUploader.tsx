import { db, storage } from '@firebase/client';
import { faFile, type IconDefinition } from '@fortawesome/free-regular-svg-icons';
import {
	faArrowLeft,
	faDownload,
	faFileUpload,
	faFolder,
	faFolderPlus,
	faSpinner,
	faTrash,
	faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import type { UserRecord } from 'firebase-admin/auth';
import React, { type FC, useEffect, useState } from 'react';
import { popupStore } from 'src/hooks/popupStores';

import { requestUserInput } from './InputPopup';
import Modal from './Modal';

interface initialState {
	isLoading: boolean;
	currentFolder: Folder;
	Folders: Folder[];
	Files: FirestoreFile[];
}

interface Folder {
	createdAt: Timestamp;
	name: string;
	parent: Folder | null;
	lastAccessed: Timestamp;
	updatedAt: Timestamp;
	userId: string;
	createdBy: string;
	id: string;
}

export interface FirestoreFile {
	createdAt: Timestamp;
	createdBy: string;
	data: string;
	name: string;
	lastAccessed: Timestamp;
	parent: Folder;
	updatedAt: Timestamp;
	userId: string;
	url: string;
	id: string;
	path: string;
}

interface FileUploaderProps {
	userRecord?: UserRecord;
	type: 'picker' | 'uploader';
	buttonText?: string;
	buttonIcon?: IconDefinition;
	className?: string;
	acceptedTypes?: string;
	onFileSelected?: (file: FirestoreFile) => void;
}

const FileUploader: FC<FileUploaderProps> = ({
	userRecord,
	type,
	buttonText,
	buttonIcon,
	className,
	acceptedTypes,
	onFileSelected,
}) => {
	if (userRecord == null) {
		return null;
	}

	const rootFolder: Folder = {
		createdAt: Timestamp.fromDate(new Date()),
		name: 'root',
		parent: null,
		lastAccessed: Timestamp.fromDate(new Date()),
		updatedAt: Timestamp.fromDate(new Date()),
		userId: userRecord.uid,
		createdBy: userRecord.uid,
		id: 'root',
	};

	const defaultState: initialState = {
		isLoading: false,
		currentFolder: rootFolder,
		Folders: [],
		Files: [],
	};

	const [initialState, setInitialState] = useState<initialState>(defaultState);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const [isLoading, setIsLoading] = useState(false);

	const [currentPath, setCurrentPath] = useState<Folder[]>([rootFolder]);

	const closeModal = (): void => {
		setIsModalOpen(false);
		setInitialState(defaultState);
	};

	const getFolders = async (): Promise<void> => {
		try {
			const folderRef = collection(db, 'folders');
			const folderSnapshot = await getDocs(folderRef);
			const folders: Folder[] = [];
			folderSnapshot.forEach((doc) => {
				const data = doc.data() as Folder;
				if (data.parent?.id === initialState.currentFolder.id) {
					folders.push({ ...data, id: doc.id });
				}
			});
			setInitialState((prevState) => ({
				...prevState,
				Folders: folders,
			}));
		} catch (error) {
			popupStore.set({
				title: 'Error',
				message: 'Error al obtener las carpetas',
				type: 'danger',
				visible: true,
			});
		}
	};

	const getFiles = async (): Promise<void> => {
		try {
			const fileRef = collection(db, 'files');
			const fileSnapshot = await getDocs(fileRef);
			const files: FirestoreFile[] = [];
			fileSnapshot.forEach((doc) => {
				const data = doc.data() as FirestoreFile;
				if (data.parent.id === initialState.currentFolder.id) {
					if (acceptedTypes != null) {
						const fileExtension = data.name.split('.').pop()?.toLowerCase();
						if (fileExtension != null && acceptedTypes.includes(fileExtension)) {
							files.push({ ...data, id: doc.id });
						}
					} else {
						files.push({ ...data, id: doc.id });
					}
				}
			});
			setInitialState((prevState) => ({
				...prevState,
				Files: files,
			}));
		} catch (error) {
			popupStore.set({
				title: 'Error',
				message: 'Error al obtener los archivos',
				type: 'danger',
				visible: true,
			});
		}
	};

	useEffect(() => {
		void fetchFilesAndFolders();
	}, [initialState.currentFolder]);

	const fetchFilesAndFolders = async (): Promise<void> => {
		try {
			setIsLoading(true);
			await getFolders();
			await getFiles();
		} catch {
			popupStore.set({
				title: 'Error',
				message: 'Error al obtener los archivos y carpetas',
				type: 'danger',
				visible: true,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateFolder = async (): Promise<void> => {
		try {
			const folderName = await requestUserInput(
				'text',
				'Nombre de la carpeta',
				'Crear Carpeta',
				'El nombre de la carpeta es inválido',
			);
			await createFolder(folderName);
			popupStore.set({
				title: 'Carpeta creada',
				message: `La carpeta ${folderName} ha sido creada satisfactoriamente`,
				type: 'success',
				visible: true,
			});
			await getFolders();
		} catch (error: any) {
			popupStore.set({
				title: 'Error',
				message: error.message,
				type: 'danger',
				visible: true,
			});
		}
	};

	const createFolder = async (folderName: string): Promise<void> => {
		// check if folder exists
		if (initialState.Folders.some((folder) => folder.name === folderName)) {
			throw new Error('Esta carpeta ya existe');
		}

		// check if folder name is valid
		if (folderName === '') {
			throw new Error('El nombre ingresado no es válido');
		}

		// create a folder in firebase document
		const folderRef = collection(db, 'folders');
		await addDoc(folderRef, {
			createdAt: Timestamp.fromDate(new Date()),
			name: folderName,
			parent: initialState.currentFolder,
			lastAccessed: Timestamp.fromDate(new Date()),
			updatedAt: Timestamp.fromDate(new Date()),
			userId: userRecord?.uid,
		});
	};

	const handleDeleteFolder = async (folder: Folder): Promise<void> => {
		try {
			const confirm = window.confirm(`¿Está seguro que desea eliminar la carpeta "${folder.name}"?`);
			if (confirm) {
				await deleteFolder(folder);
				popupStore.set({
					title: 'Carpeta eliminada',
					message: `La carpeta ${folder.name} ha sido eliminada satisfactoriamente`,
					type: 'success',
					visible: true,
				});
				await getFolders();
			}
		} catch (error: any) {
			console.error('Error al eliminar la carpeta', error);
			popupStore.set({
				title: 'Error',
				message: error.message,
				type: 'danger',
				visible: true,
			});
		}
	};

	const deleteFolder = async (folder: Folder): Promise<void> => {
		try {
			// Primero, elimina la carpeta de Firestore
			const folderRef = doc(db, 'folders', folder.id);
			await deleteDoc(folderRef);

			// Luego, elimina todos los archivos dentro de la carpeta de Firestore y de Firebase Storage
			const filesRef = collection(db, 'files');
			const filesQuerySnapshot = await getDocs(query(filesRef, where('parent.id', '==', folder.id)));
			await Promise.all(
				filesQuerySnapshot.docs.map(async (doc) => {
					const file = doc.data() as FirestoreFile;
					// Elimina la referencia del archivo en Firestore
					await deleteDoc(doc.ref);
					// Elimina el archivo de Firebase Storage
					const fileStorageRef = ref(storage, `files/${file.path}/${file.name}`);
					await deleteObject(fileStorageRef);
				}),
			);

			// Si tu estructura de datos incluye subcarpetas dentro de esta carpeta, repite el proceso para cada subcarpeta
			const foldersRef = collection(db, 'folders');
			const foldersQuerySnapshot = await getDocs(query(foldersRef, where('parent.id', '==', folder.id)));
			await Promise.all(
				foldersQuerySnapshot.docs.map(async (doc) => {
					const folder = doc.data() as Folder;
					const subFolder: Folder = { ...folder, id: doc.id };
					// Recursivamente elimina la subcarpeta y su contenido
					await deleteFolder(subFolder);
				}),
			);

			// Actualizar la UI o el estado según sea necesario después de la eliminación
		} catch (error) {
			console.error('Error al eliminar la carpeta y su contenido:', error);
			// Manejar el error, posiblemente actualizando el estado de la UI para mostrar un mensaje al usuario
		}
	};

	const uploadFile = async (file: File, fileName: string): Promise<void> => {
		// upload file to firebase storage and create document in firestore
		const storageRef = ref(storage, `files/${currentPath.map((folder) => folder.name).join('/')}/${fileName}`);
		const fileArrayBuffer = await file.arrayBuffer();
		await uploadBytes(storageRef, fileArrayBuffer);
		const fileRef = collection(db, 'files');
		const fileSnapshot = await getDownloadURL(storageRef);
		const path = currentPath.map((folder) => folder.name).join('/');
		await addDoc(fileRef, {
			createdAt: Timestamp.fromDate(new Date()),
			createdBy: userRecord?.uid,
			data: fileSnapshot,
			name: fileName,
			lastAccessed: Timestamp.fromDate(new Date()),
			parent: initialState.currentFolder,
			updatedAt: Timestamp.fromDate(new Date()),
			userId: userRecord?.uid,
			url: fileSnapshot,
			path,
		});
	};

	const handleUploadFile = async (): Promise<void> => {
		try {
			const file = await requestUserInput('file', false, '*', false);

			if (file instanceof File) {
				await uploadFile(file, file.name);
				popupStore.set({
					title: 'Archivo subido',
					message: 'Los archivos han sido subidos satisfactoriamente',
					type: 'success',
					visible: true,
				});
			}
			await getFiles();
		} catch (error: any) {
			popupStore.set({
				title: 'Error',
				message: error.message,
				type: 'danger',
				visible: true,
			});
		}
	};

	const handleDeleteFile = async (file: FirestoreFile): Promise<void> => {
		try {
			const confirm = window.confirm(`¿Está seguro que desea eliminar el archivo "${file.name}"?`);
			if (confirm) {
				await deleteFile(file);
				popupStore.set({
					title: 'Archivo eliminado',
					message: `El archivo ${file.name} ha sido eliminado satisfactoriamente`,
					type: 'success',
					visible: true,
				});
				await getFiles();
			}
		} catch (error: any) {
			popupStore.set({
				title: 'Error',
				message: error.message,
				type: 'danger',
				visible: true,
			});
		}
	};

	const deleteFile = async (file: FirestoreFile): Promise<void> => {
		// delete file from firestore
		const fileRef = doc(db, 'files', file.id);
		const fileSnapshot = await getDoc(fileRef);
		if (fileSnapshot.exists()) {
			await deleteDoc(fileRef);
		} else {
			throw new Error('El archivo no existe');
		}
		// delete file from storage
		const storageRef = ref(storage, `files/${currentPath.map((folder) => folder.name).join('/')}/${file.name}`);
		await deleteObject(storageRef);
	};

	return (
		<>
			<button
				type="button"
				className={
					className ??
					'bg-edgewater-600 p-2 rounded-md hover:bg-edgewater-500 transition-all duration-200 ease-in-out px-3'
				}
				onClick={() => {
					setIsModalOpen(true);
				}}
			>
				<FontAwesomeIcon icon={buttonIcon ?? faUpload} /> {buttonText ?? 'Subir Archivos'}
			</button>
			<Modal title="Subir Archivos" onClose={closeModal} isOpen={isModalOpen} width={700}>
				<div className="space-y-4">
					<div className="flex gap-x-4 justify-between items-center">
						<div className="space-x-4">
							<button
								type="button"
								className="bg-edgewater-600 p-2 rounded-md hover:bg-edgewater-500 transition-all duration-200 ease-in-out px-3"
								onClick={() => {
									void handleCreateFolder();
								}}
							>
								<FontAwesomeIcon icon={faFolderPlus} /> &nbsp; Crear Carpeta
							</button>
							<button
								type="button"
								className="bg-edgewater-600 p-2 rounded-md hover:bg-edgewater-500 transition-all duration-200 ease-in-out px-3"
								onClick={() => {
									void handleUploadFile();
								}}
							>
								<FontAwesomeIcon icon={faFileUpload} /> &nbsp; Subir Archivos
							</button>
						</div>
					</div>
					<div>
						<div className="p-2 px-4 bg-edgewater-700 rounded-md bg-opacity-50 flex gap-4 items-center justify-start">
							{initialState.currentFolder.parent != null && (
								<button
									type="button"
									className="text-white text-opacity-50 hover:text-opacity-100 hover:-translate-x-1 transition-all duration-200 ease-in-out"
									onClick={() => {
										setInitialState({
											...initialState,
											currentFolder:
												initialState.currentFolder.parent ?? initialState.currentFolder,
										});
										// actualizar el estado de currentPath
										setCurrentPath((prevState) => {
											return prevState.slice(0, prevState.length - 1);
										});
									}}
								>
									<FontAwesomeIcon icon={faArrowLeft} />
								</button>
							)}
							<h1 className="opacity-50">
								/
								{currentPath.map((folder, idx) => {
									return (
										<>
											<span
												key={idx}
												className="solid border-white hover:border-b-[1px] cursor-pointer"
												onClick={() => {
													// ir a la carpeta seleccionada
													setInitialState({ ...initialState, currentFolder: folder });
													setCurrentPath((prevState) => {
														return prevState.slice(0, idx + 1);
													});
												}}
											>
												{folder.name}
											</span>
											/
										</>
									);
								})}
							</h1>
						</div>
						<div className="flex gap-4 items-center p-2 flex-col justify-start">
							{!isLoading ? (
								<>
									<h1 className="text-white font-bold text-2xl w-full">Carpetas</h1>
									<div className="grid grid-cols-3 gap-4 mt-4 w-full max-h-40 overflow-y-auto">
										{initialState.Folders.map((folder: Folder, idx) => (
											<button
												key={folder.name + idx}
												className="flex flex-col items-center justify-center aspect-square w-32 h-32 rounded-md bg-edgewater-700 p-4  transition-all duration-200 ease-in-out cursor-pointer gap-4 relative select-none focus:bg-edgewater-600"
												onDoubleClick={() => {
													setInitialState({ ...initialState, currentFolder: folder });
													setCurrentPath((prevState) => {
														return [...prevState, folder];
													});
												}}
											>
												<FontAwesomeIcon
													icon={faTrash}
													className="absolute top-0 right-0 opacity-50 hover:opacity-100 text-red-500 cursor-pointer p-2"
													onClick={() => {
														void handleDeleteFolder(folder);
													}}
												/>
												<FontAwesomeIcon icon={faFolder} className="w-10 h-10" />
												<h1
													className="text-white text-lg max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap"
													title={folder.name}
												>
													{folder.name}
												</h1>
											</button>
										))}
									</div>
									<h1 className="text-white font-bold text-2xl w-full">Archivos</h1>
									<div className="grid grid-cols-3 gap-4 mt-4 w-full max-h-40 overflow-y-auto">
										{initialState.Files.map((file: FirestoreFile, idx) => (
											<button
												key={file.name + idx}
												className="flex flex-col items-center justify-center aspect-square w-32 h-32 rounded-md bg-edgewater-700 p-4  transition-all duration-200 ease-in-out cursor-pointer gap-4 relative select-none focus:bg-edgewater-600"
												onDoubleClick={() => {
													if (type === 'picker') {
														onFileSelected?.(file);
														closeModal();
													} else {
														window.open(file.url, '_blank');
													}
												}}
											>
												<FontAwesomeIcon
													icon={faTrash}
													className="absolute top-0 right-0 opacity-50 hover:opacity-100 text-red-500 cursor-pointer p-2"
													onClick={() => {
														// delete file
														void handleDeleteFile(file);
													}}
												/>
												<FontAwesomeIcon
													icon={faDownload}
													className="absolute top-0 left-0 opacity-50 hover:opacity-100 text-green-500 cursor-pointer p-2"
													onClick={() => {
														// delete file
														window.open(file.url, '_blank');
													}}
												/>
												<FontAwesomeIcon icon={faFile} className="w-10 h-10" />
												<h1
													className="text-white text-lg max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap"
													title={file.name}
												>
													{file.name}
												</h1>
											</button>
										))}
									</div>
								</>
							) : (
								<>
									<div className="w-full flex items-center justify-center">
										<FontAwesomeIcon icon={faSpinner} className="animate-spin w-20 h-20" />
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default FileUploader;
