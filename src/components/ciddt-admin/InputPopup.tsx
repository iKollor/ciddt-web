/* eslint-disable import/no-named-as-default */
/* eslint-disable import/no-named-as-default-member */
import 'react-image-crop/src/ReactCrop.scss';

import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'framer-motion';
import { type SyntheticEvent, useRef, useState } from 'react';
import ReactCrop, { centerCrop, convertToPixelCrop, type Crop, makeAspectCrop, type PixelCrop } from 'react-image-crop';
import { inputPopupStore } from 'src/hooks/popupStores';
import type { FilePreview, InputType } from 'src/interfaces/popUp';
import validator from 'validator';

import Tooltip from './Tooltip';

const InputPopup: React.FC = () => {
	const popUpState = useStore(inputPopupStore);

	const [files, setFiles] = useState<FilePreview[] | undefined>(undefined);

	const [crop, setCrop] = useState<Crop>();

	const imageRef = useRef<HTMLImageElement>(null);

	const popupVariants = {
		open: {
			scale: 1,
			opacity: 1,
			transition: { type: 'spring', damping: 15, stiffness: 300, restDelta: 0.001 },
		},
		closed: {
			scale: 0,
			opacity: 0,
			transition: { duration: 0.3, ease: 'easeInOut' },
		},
	};

	const handleClose = (): void => {
		inputPopupStore.set({ ...popUpState, visible: false, content: '', closedByUser: true, selectedFiles: [] });
		setFiles(undefined);
	};

	const handleSubmit = async (): Promise<void> => {
		let croppedFile: FilePreview[] | undefined;
		if (popUpState.type === 'image') {
			if (
				popUpState.imageCrop === true &&
				crop?.width !== 0 &&
				crop?.height !== 0 &&
				popUpState.allowMultiple === false &&
				crop != null
			) {
				try {
					const selectedFile = (popUpState.selectedFiles as FilePreview[])[0].file;
					if (selectedFile != null) {
						const imageUrl = URL.createObjectURL(selectedFile);
						const blob = await getCroppedImg(
							imageUrl,
							convertToPixelCrop(
								crop,
								imageRef.current?.naturalWidth ?? 0,
								imageRef.current?.naturalHeight ?? 0,
							),
							selectedFile.type,
						);
						const croppedImage = new File([blob], selectedFile.name, { type: selectedFile.type });
						const croppedImageUrl = URL.createObjectURL(croppedImage);
						croppedFile = [
							{
								file: croppedImage,
								previewUrl: croppedImageUrl,
							},
						];

						URL.revokeObjectURL(imageUrl);
					}
				} catch (error) {
					console.error('Error al procesar la imagen: ', error);
				}
			} else {
				if (files != null) {
					inputPopupStore.set({
						...popUpState,
						selectedFiles: files,
					});
				}
			}
		} else if (popUpState.type === 'file') {
			if (files != null) {
				inputPopupStore.set({
					...popUpState,
					selectedFiles: files,
				});
			}
		}

		// Confirmación y cierre
		if (
			window.confirm(
				`¿Estás seguro?: ${
					(popUpState.selectedFiles as FilePreview[])
						?.map((file) => {
							return file.file?.name;
						})
						.join(', ') ??
					popUpState.content ??
					''
				}`,
			)
		) {
			inputPopupStore.set({
				...popUpState,
				visible: false,
				closedByUser: false,
				selectedFiles: croppedFile ?? files ?? [],
			});
			setFiles(undefined);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const files = e.target.files;

		if (files != null) {
			const filesPreview = Array.from(files).map((file) => ({
				file,
				previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
			}));
			inputPopupStore.set({
				...popUpState,
				selectedFiles: filesPreview,
			});
			setFiles(filesPreview);
		}
	};

	function changeCrop(event: SyntheticEvent<HTMLImageElement, Event>): void {
		const { naturalWidth: width, naturalHeight: height } = event.currentTarget;
		const crop = centerCrop(
			makeAspectCrop(
				{
					unit: '%',
					height: 100,
				},
				popUpState.imageCropAspectRatio ?? 1,
				width,
				height,
			),
			width,
			height,
		);
		setCrop(crop);
	}

	return (
		<AnimatePresence>
			{popUpState.visible && (
				<motion.div
					initial="closed"
					animate="open"
					exit="closed"
					variants={popupVariants}
					className="inputPopup fixed text-left origin-center flex flex-col justify-center items-center gap-2 align-middle rounded-lg p-4 px-6 text-sm max-w-[400px] min-w-[250px] bg-edgewater-700 z-[51]"
					style={{ top: 100, left: '50%', translateX: '-50%' }} // Ajustes de estilo para posicionamiento
					id="popup"
					role="alert"
				>
					<p className="w-full text-center mt-6">
						<span className="font-medium text-2xl text-white text-center">{popUpState.message}</span>
						<br />
					</p>
					<div className="z-[1] flex flex-col w-full justify-center items-center align-middle gap-4">
						<input
							name={popUpState.type}
							type={popUpState.type === 'image' ? 'file' : popUpState.type}
							multiple={popUpState.allowMultiple}
							accept={popUpState.acceptedTypes}
							autoComplete="on"
							onChange={(e) => {
								if (popUpState.type === 'file' || popUpState.type === 'image') {
									handleFileChange(e);
								} else {
									inputPopupStore.set({ ...popUpState, content: e.target.value });
								}
							}}
							placeholder={popUpState.placeholder}
							required
							className="bg-white block w-full rounded-md border-0 py-1.5 px-1.5 text-gray shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6 z-[1]"
							defaultValue={popUpState.value ?? ''}
						/>
						{popUpState.type === 'image' || popUpState.type === 'file' ? (
							<div>
								{files?.map((filePreview, index) =>
									filePreview.previewUrl != null ? (
										<div key={index} className="flex flex-col justify-center items-center gap-2">
											<div className="text-center">
												<h1 className="text-xl bold">{popUpState.inputImageTitle}</h1>
												<p>{popUpState.inputImageSubtitle}</p>
											</div>
											{popUpState.type === 'image' ? (
												popUpState.imageCrop === true ? (
													<ReactCrop
														crop={crop}
														onChange={(_crop, percentCrop) => {
															setCrop(percentCrop);
														}}
														aspect={popUpState.imageCropAspectRatio ?? 1}
														style={{ maxWidth: '100%', maxHeight: '200px' }}
														minHeight={100}
														minWidth={100}
													>
														<img
															ref={imageRef}
															src={filePreview.previewUrl}
															alt={`Preview ${filePreview.file?.name}`}
															onLoad={changeCrop}
														/>
													</ReactCrop>
												) : (
													<img
														src={filePreview.previewUrl}
														alt={`Preview ${filePreview.file?.name}`}
													/>
												)
											) : null}

											<Tooltip
												children={
													<p className="truncate max-w-[350px]">{filePreview.file?.name}</p>
												}
												content={filePreview.file?.name ?? ''}
											/>
										</div>
									) : (
										<div key={index}>
											<Tooltip
												children={
													<p className="truncate max-w-[350px]">{filePreview.file?.name}</p>
												}
												content={filePreview.file?.name ?? ''}
											/>
										</div>
									),
								)}
							</div>
						) : null}
						<button
							type="button"
							onClick={() => {
								void handleSubmit();
							}}
							className="text-white bg-edgewater-400 hover:bg-edgewater-500 transition-all p-2 px-6 m-2 text-center rounded-md z-[1]"
						>
							OK
						</button>
					</div>
					<motion.a
						onClick={handleClose}
						className="w-4 h-4 absolute right-4 top-3 cursor-pointer"
						id="button"
						initial={{
							stroke: '#fff',
							fill: '#fff',
							strokeWidth: 2,
							opacity: 0.6,
							scale: 1,
						}}
						whileHover={{
							opacity: 1,
							scale: 1.5,
							rotate: 90,
						}}
						transition={{
							duration: 0.2,
						}}
					>
						<svg viewBox="0 -.5 21 21">
							<motion.path
								d="M12.018 10L21 18.554 19.481 20 10.5 11.446 1.518 20 0 18.554 8.981 10 0 1.446 1.518 0 10.5 8.554 19.481 0 21 1.446z"
								fillRule="evenodd"
							/>
						</svg>
					</motion.a>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default InputPopup;

// Sobrecarga para tipos que no son 'file' o 'image'
/**
 * Requests user input for general input types.
 * @param type - The type of input field, excluding 'file' and 'image'.
 * @param placeholder - The placeholder text for the input field.
 * @param message - The message to display to the user.
 * @param errorMessage - The error message to display if the input is invalid.
 * @param value - The initial value for the input field.
 * @returns A promise that resolves with the user's input value.
 * @throws Error if the specified type is not implemented.
 */
export async function requestUserInput(
	type: Exclude<InputType, 'file' | 'image'>,
	placeholder: string,
	message: string,
	errorMessage: string,
	value?: string,
): Promise<string>;

/**
 * Requests user input specifically for file inputs.
 * @param type - The type of input field ('file' or 'image').
 * @param allowMultiple - Whether multiple files can be selected.
 * @param acceptedTypes - The accepted file types, e.g., '.jpg, .png'.
 * @param errorMessage - The error message to display if the input is invalid.
 * @param imageCrop - Whether to crop the image.
 * @param imageCropAspectRatio - The aspect ratio to use for cropping.
 * @param inputImageTitle - The title to display for the image input.
 * @param inputImageSubtitle - The subtitle to display for the image input.
 * @returns A promise that resolves with the selected file(s).
 * @throws Error if the required parameters are missing for 'file' or 'image' types.
 */
export async function requestUserInput(
	type: 'file' | 'image',
	allowMultiple: boolean,
	acceptedTypes: string,
	imageCrop?: boolean,
	imageCropAspectRatio?: number,
	inputImageTitle?: string,
	inputImageSubtitle?: string,
): Promise<File | File[]>;

// Implementación genérica
export async function requestUserInput(
	type: InputType,
	arg2: string | boolean, // arg2: allowMultiple | placeholder
	arg3?: string, // arg3: acceptedTypes | message
	arg4?: string | boolean, // arg4: errorMessage | imageCrop
	arg5?: number | string, // arg5: imageCropAspectRatio | value
	inputImageTitle?: string,
	inputImageSubtitle?: string,
): Promise<string | File | File[]> {
	const notImplementedTypes: InputType[] = ['checkbox', 'radio', 'range', 'submit', 'reset', 'button', 'hidden'];

	if (notImplementedTypes.includes(type)) {
		throw new Error(`Type '${type}' not implemented in this function`);
	}

	if (type === 'file' || type === 'image') {
		if (
			typeof arg2 !== 'boolean' ||
			typeof arg3 !== 'string' ||
			!(typeof arg4 === 'boolean' || typeof arg4 === 'undefined') ||
			!(typeof arg5 === 'number' || typeof arg5 === 'undefined')
		) {
			console.log(arg2, arg3, arg4, arg5);
			throw new Error("Missing or incorrect parameters for 'file' or 'image' type");
		}

		return await requestFileInput(
			type,
			arg2, // arg2: allowMultiple
			arg3, // arg3: acceptedTypes
			arg4, // arg4: errorMessage
			arg5,
			inputImageTitle,
			inputImageSubtitle,
		);
	} else {
		if (
			typeof arg2 !== 'string' ||
			typeof arg3 !== 'string' ||
			typeof arg4 !== 'string' ||
			(typeof arg5 !== 'string' && typeof arg5 !== 'undefined')
		) {
			console.log(arg2, arg3, arg4, arg5);
			throw new Error('Missing or incorrect parameters for input type');
		}

		inputPopupStore.set({
			visible: true,
			content: '',
			placeholder: arg2, // arg2: placeholder
			type,
			message: arg3, // arg3: message
			value: arg5, // arg5: value
		});

		return await new Promise((resolve, reject) => {
			const unsubscribe = inputPopupStore.subscribe((state) => {
				if (!state.visible && state.content != null) {
					if (state.closedByUser === true)
						reject(new Error('User closed popup', { cause: { userClosed: true } }));
					if (!validateInput(state.content, type)) reject(new Error(arg4));

					resolve(state.content);

					unsubscribe();
				}
			});
		});
	}
}

function validateInput(input: string, type: InputType): boolean {
	switch (type) {
		case 'email':
			return validator.isEmail(input);
		case 'password':
			return validator.isLength(input, { min: 6 });
		case 'text':
			return input.trim().length > 0;
		case 'number':
			return !isNaN(parseFloat(input)) && isFinite(input as any);
		case 'tel':
			return validator.isMobilePhone(input);
		case 'url':
			return validator.isURL(input);
		case 'date':
			return validator.isDate(input);
		case 'time':
			return validarHora(input);
		case 'datetime-local':
			return validator.isISO8601(input);
		case 'color':
			return validator.isHexColor(input);
		case 'month':
			return validarMes(input);
		case 'week':
			return validarSemana(input);
		default:
			return false;
	}
}

function validarHora(hora: string): boolean {
	const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
	return regex.test(hora);
}

function validarMes(mes: string): boolean {
	const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
	return regex.test(mes);
}

function validarSemana(semana: string): boolean {
	const regex = /^\d{4}-W(0[1-9]|[1-4][0-9]|5[0-3])$/;
	return regex.test(semana);
}

async function requestFileInput(
	type: 'file' | 'image',
	allowMultiple: boolean,
	acceptedTypes: string,
	imageCrop?: boolean,
	imageCropAspectRatio?: number,
	inputImageTitle?: string,
	inputImageSubtitle?: string,
): Promise<File | File[]> {
	return await new Promise((resolve, reject) => {
		inputPopupStore.set({
			visible: true,
			type,
			message: 'Selecciona un archivo',
			allowMultiple,
			acceptedTypes,
			imageCrop,
			imageCropAspectRatio,
			inputImageTitle,
			inputImageSubtitle,
		});

		const unsubscribe = inputPopupStore.subscribe((state) => {
			if (!state.visible) {
				if (state.closedByUser === true)
					reject(new Error('User closed popup', { cause: { userClosed: true } }));

				const selectedFiles = state.selectedFiles as FilePreview[];
				if (selectedFiles != null && selectedFiles.length > 0) {
					const files = selectedFiles.map((filePreview) => filePreview.file);
					resolve(allowMultiple ? files : files[0]);
				} else {
					reject(new Error('No file selected'));
				}
				unsubscribe();
			}
		});
	});
}
/**
 * Crea una imagen recortada a partir de una imagen original y parámetros de recorte.
 * @param imageSrc La URL de la imagen original.
 * @param crop Los parámetros de recorte en píxeles.
 * @param type El tipo de archivo de la imagen.
 * @returns {Promise<Blob>} Un blob de la imagen recortada.
 */
export async function getCroppedImg(imageSrc: string, crop: PixelCrop, type: Blob['type']): Promise<Blob> {
	const image = new Image();
	image.src = imageSrc;
	await new Promise((resolve) => {
		image.onload = resolve;
	});
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	if (ctx == null) {
		throw new Error('No se pudo crear un contexto de canvas');
	}
	const pixelRatio = window.devicePixelRatio;
	const scaleX = image.naturalWidth / image.width;
	const scaleY = image.naturalHeight / image.height;
	canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
	canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

	ctx.scale(pixelRatio, pixelRatio);
	ctx.imageSmoothingQuality = 'high';
	ctx.save();

	const cropX = crop.x * scaleX;
	const cropY = crop.y * scaleY;

	ctx.translate(-cropX, -cropY);
	ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, image.naturalWidth, image.naturalHeight);

	ctx.restore();

	return await new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob == null) {
				reject(new Error('Canvas is empty'));
				return;
			}
			resolve(blob);
		}, type);
	});
}
