/* eslint-disable import/no-named-as-default-member */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'framer-motion';
import { inputPopupStore } from 'src/hooks/popupStores';
import type { InputType } from 'src/interfaces/popUp';
import validator from 'validator';

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
		console.log(popUpState.content);
		if (window.confirm(`¿Estás seguro?: ${popUpState.content}`)) {
			inputPopupStore.set({ ...popUpState, visible: false }); // Actualizar el estado para ocultar el popup
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
					className="inputPopup fixed text-left origin-center flex flex-col justify-center items-center gap-2 align-middle rounded-lg p-4 px-6 text-sm max-w-[400px] min-w-[250px] bg-edgewater-700 z-[100000]"
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
							type={popUpState.type}
							autoComplete="on"
							onChange={(e) => {
								inputPopupStore.set({ ...popUpState, content: e.target.value });
							}}
							placeholder={popUpState.placeholder}
							required
							className="bg-white block w-full rounded-md border-0 py-1.5 px-1.5 text-gray shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6 z-[1]"
						/>
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
/**
 * Prompts the user for input using a popup window.
 *
 * @param {string} placeholder - The placeholder text to display in the input field.
 * @param {InputType} type - The type of input field to display (e.g., email, password, text).
 * @param {string} message - The message to display above the input field.
 * @param {string} errorMessage - The error message to display if the user input is invalid.
 * @returns {Promise<string>} - A promise that resolves with the user input if it is valid, or rejects with an error if it is invalid.
 */
export async function requestUserInput(
	placeholder: string,
	type: InputType,
	message: string,
	errorMessage: string,
): Promise<string> {
	inputPopupStore.set({
		visible: true,
		content: '',
		placeholder,
		type,
		message,
	});

	return await new Promise((resolve, reject) => {
		const unsubscribe = inputPopupStore.subscribe((state) => {
			// Check if the popup is closed
			if (!state.visible) {
				if (validateInput(state.content, type)) {
					resolve(state.content);
				} else {
					reject(new Error(errorMessage));
				}
				unsubscribe();
			}
		});
	});
}

function validateInput(input: string, type: InputType): boolean {
	switch (type) {
		case 'email':
			return validator.isEmail(input);
		case 'password':
			// Definir los criterios para una contraseña válida
			return validator.isLength(input, { min: 6 });
		case 'text':
			return validator.isLength(input, { min: 1 });
		case 'number':
			return validator.isNumeric(input);
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
		case 'month':
			// Puedes implementar tu propia lógica aquí
			return true;
		case 'week':
			// Puedes implementar tu propia lógica aquí
			return true;
		case 'color':
			return validator.isHexColor(input);
		default:
			return false;
	}
}

function validarHora(hora: string): boolean {
	// Expresión regular para validar una hora en formato 24 horas (HH:mm)
	const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
	return regex.test(hora);
}
