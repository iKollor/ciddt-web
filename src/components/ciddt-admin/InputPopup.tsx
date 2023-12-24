/* eslint-disable import/no-named-as-default-member */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'framer-motion';
import { inputPopupStore } from 'src/hooks/popupStores';
import type { InputType } from 'src/interfaces/popUp';
import validator from 'validator';

import Tooltip from './Tooltip';

const InputPopup = () => {
	const popUpState = useStore(inputPopupStore);
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
		inputPopupStore.set({ ...popUpState, visible: false, content: '' }); // Actualizar el estado para ocultar el popup
	};

	const handleSubmit = (): void => {
		let displayContent;

		if (popUpState.type === 'text') {
			displayContent = popUpState.content; // Contenido para tipos de texto
		} else if (popUpState.type === 'file' || popUpState.type === 'image') {
			// Muestra los nombres de los archivos seleccionados
			const fileNames = popUpState.selectedFiles?.map((filePreview) => filePreview.file.name).join(', ');
			displayContent = fileNames ?? 'No files selected';
		} else {
			displayContent = 'Unknown content';
		}

		if (window.confirm(`¿Estás seguro?: ${displayContent}`)) {
			inputPopupStore.set({ ...popUpState, visible: false });
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;

		if (files != null && files.length > 0) {
			const filePreviews = Array.from(files).map((file) => {
				const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
				return { file, previewUrl };
			});

			inputPopupStore.set({ ...popUpState, selectedFiles: filePreviews });
		}
	};

	return (
		<AnimatePresence>
			{popUpState.visible && (
				<motion.div
					initial="closed"
					animate="open"
					exit="closed"
					variants={popupVariants}
					className="inputPopup fixed text-left origin-center flex flex-col justify-center items-center gap-2 align-middle rounded-lg p-4 px-6 text-sm max-w-[400px] min-w-[250px] bg-edgewater-700 z-[48]"
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
						/>
						{popUpState.type === 'image' || popUpState.type === 'file' ? (
							<div>
								{popUpState.selectedFiles?.map((filePreview, index) =>
									filePreview.previewUrl != null ? (
										<div key={index} className="flex flex-col justify-center items-center gap-2">
											<img
												src={filePreview.previewUrl}
												alt={`Preview ${index}`}
												style={{ maxWidth: '100%', maxHeight: '200px' }}
											/>
											<Tooltip
												children={
													<p className="truncate max-w-[350px]">{filePreview.file.name}</p>
												}
												content={filePreview.file.name}
											/>
										</div>
									) : (
										<div key={index}>
											<Tooltip
												children={
													<p className="truncate max-w-[350px]">{filePreview.file.name}</p>
												}
												content={filePreview.file.name}
											/>
										</div>
									),
								)}
							</div>
						) : null}
						<button
							type="button"
							onClick={handleSubmit}
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
 * @returns A promise that resolves with the user's input value.
 * @throws Error if the specified type is not implemented.
 */
export async function requestUserInput(
	type: Exclude<InputType, 'file' | 'image'>,
	placeholder: string,
	message: string,
	errorMessage: string,
): Promise<string>;

/**
 * Requests user input specifically for file inputs.
 * @param type - The type of input field ('file' or 'image').
 * @param allowMultiple - Whether multiple files can be selected.
 * @param acceptedTypes - The accepted file types, e.g., '.pdf, .docx'.
 * @returns A promise that resolves with the selected file(s).
 * @throws Error if the required parameters are missing for 'file' or 'image' types.
 */
export async function requestUserInput(
	type: 'file' | 'image',
	allowMultiple: boolean,
	acceptedTypes: string,
): Promise<File | File[]>;

// Implementación genérica
export async function requestUserInput(
	type: InputType,
	arg2: string | boolean, // arg2: allowMultiple | placeholder
	arg3?: string, // arg3: acceptedTypes | message
	arg4?: string, // arg4: errorMessage
): Promise<string | File | File[]> {
	const notImplementedTypes: InputType[] = ['checkbox', 'radio', 'range', 'submit', 'reset', 'button', 'hidden'];

	if (notImplementedTypes.includes(type)) {
		throw new Error(`Type '${type}' not implemented in this function`);
	}

	if (type === 'file' || type === 'image') {
		if (typeof arg2 !== 'boolean' || typeof arg3 !== 'string') {
			throw new Error("Missing or incorrect parameters for 'file' or 'image' type");
		}
		return await requestFileInput(arg2, arg3, type); // arg2: allowMultiple, arg3: acceptedTypes
	} else {
		if (typeof arg2 !== 'string' || typeof arg3 !== 'string' || typeof arg4 !== 'string') {
			throw new Error('Missing or incorrect parameters for input type');
		}
		inputPopupStore.set({
			visible: true,
			content: '',
			placeholder: arg2, // arg2: placeholder
			type,
			message: arg3, // arg3: message
		});

		return await new Promise((resolve, reject) => {
			const unsubscribe = inputPopupStore.subscribe((state) => {
				if (!state.visible && state.content != null) {
					if (validateInput(state.content, type)) {
						resolve(state.content);
					} else {
						reject(new Error(arg4)); // arg4: errorMessage
					}
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
	allowMultiple: boolean,
	acceptedTypes: string,
	type: 'file' | 'image',
): Promise<File | File[]> {
	return await new Promise((resolve, reject) => {
		inputPopupStore.set({
			visible: true,
			type,
			message: 'Selecciona un archivo',
			allowMultiple,
			acceptedTypes,
		});

		const unsubscribe = inputPopupStore.subscribe((state) => {
			if (!state.visible) {
				if (state.selectedFiles != null && state.selectedFiles.length > 0) {
					const files = state.selectedFiles.map((filePreview) => filePreview.file);
					resolve(allowMultiple ? files : files[0]);
				} else {
					reject(new Error('No file selected'));
				}
				unsubscribe();
			}
		});
	});
}
