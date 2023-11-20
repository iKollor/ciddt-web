/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'framer-motion';
import { InputPopup as inputPopupState } from 'frontend/src/hooks/popupStores';

const InputPopup: React.FC = () => {
	const popUpState = useStore(inputPopupState) as { visible: boolean; content: string };

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
		inputPopupState.set({ ...popUpState, visible: false }); // Actualizar el estado para ocultar el popup
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
		event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

		// Comprobar si el correo electrónico está presente y es válido
		if (popUpState.content.length > 0 && /\S+@\S+\.\S+/.test(popUpState.content)) {
			console.log(popUpState.content); // Muestra el correo electrónico en la consola
			inputPopupState.set({ ...popUpState, visible: false }); // Cierra el popup
		} else {
			console.log('Correo electrónico inválido o no proporcionado');
			// Aquí puedes manejar el caso de un correo electrónico inválido o no proporcionado
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
					className="inputPopup absolute text-left top-20 flex flex-col justify-center items-center gap-4 align-middle rounded-lg p-8 mb-4 text-sm max-w-[400px] min-w-[250px] min-h-24 center bg-blue-500"
					id="popup"
					role="alert"
				>
					<p className="w-full text-center mt-4">
						<span className="font-medium text-base text-white text-center">
							Tuvimos problemas al intentar obtener tu email de Facebook, ingresa nuevamente tu email
						</span>
						<br />
					</p>
					<form
						action="#"
						id="InputPopupForm"
						method="POST"
						className="z-[1] flex flex-col w-full justify-center items-center align-middle gap-4"
						onSubmit={handleSubmit}
					>
						<input
							name="email"
							type="email"
							autoComplete="email"
							onChange={(e) => {
								inputPopupState.set({ ...popUpState, content: e.target.value });
							}}
							placeholder="Enter your email"
							required
							className="bg-white block w-full rounded-md border-0 py-1.5 px-1.5 text-gray shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6 z-[1]"
						/>
						<button
							type="submit"
							className="text-white bg-green-400 hover:bg-green-500 transition-all p-2 px-6 m-2 text-center rounded-md z-[1]"
						>
							OK
						</button>
					</form>
					<div className="absolute w-full h-full p-4">
						<motion.a
							onClick={handleClose}
							className="w-3 h-3 absolute ml-2 mr-2 right-4 cursor-pointer"
							id="button"
							initial={{
								stroke: '#fff',
								fill: '#fff',
								strokeWidth: 2,
								opacity: 0.6,
								scale: 1.5,
							}}
							whileHover={{
								opacity: 1,
								scale: 2,
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
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default InputPopup;
