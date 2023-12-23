import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'framer-motion';
import { popupStore } from 'frontend/src/hooks/popupStores';
import { useEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const Popup = () => {
	const popupState = useStore(popupStore);
	const lifeTime = 3; // Tiempo de vida del popup en segundos

	const handleClose = (): void => {
		popupStore.set({ ...popupState, visible: false }); // Actualizar el estado para ocultar el popup
	};

	useEffect(() => {
		// Definir el tiempo de vida del popup
		const timeout = setTimeout(() => {
			handleClose();
		}, lifeTime * 1000); //  3 segundos

		return () => {
			clearTimeout(timeout);
		};
	}, [popupState]);

	// Definir clases base y específicas por tipo
	const baseClass =
		'fixed text-left origin-center flex rounded-lg p-4 mb-4 text-sm max-w-[400px] min-w-[250px] min-h-24 overflow-hidden shadow-xl';

	const typeClasses = {
		info: 'bg-blue text-white',
		danger: 'bg-red text-white',
		success: 'bg-green text-white',
		warning: 'bg-yellow text-white',
	};

	// Obtener las clases apropiadas para el tipo dado
	const alertClasses = `popup ${baseClass} ${typeClasses[popupState.type]}`;

	const icons = {
		info: (
			<svg className="w-16 h-full inline mr-3" fill="currentColor" viewBox="0 0 20 20">
				<path
					fillRule="evenodd"
					d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
					clipRule="evenodd"
				/>
			</svg>
		),
		danger: (
			<svg className="w-16 h-full inline mr-3" fill="currentColor" viewBox="0 0 25 25">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12zm9 1a1 1 0 102 0V8a1 1 0 10-2 0v5zm2 2.989a1 1 0 10-2 0V16a1 1 0 102 0v-.011z"
				/>
			</svg>
		),
		success: (
			<svg className="w-16 h-full inline mr-3" fill="currentColor" viewBox="0 0 25 25">
				<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.2 14.8l-3.7-3.7 1.4-1.4 2.2 2.2 5.8-6.1L18 9.3l-7.2 7.5z" />
				<path fill="none" d="M0 0h24v24H0z" />
			</svg>
		),
		warning: (
			<svg className="w-16 h-full inline mr-3" fill="currentColor" viewBox="0 0 40 40">
				<path d="M30.555 25.219L18.036 3.783a2.675 2.675 0 00-3.782 0L1.734 25.219a2.674 2.674 0 000 3.781h28.82a2.671 2.671 0 00.001-3.781zM14.992 11.478a1.5 1.5 0 113 0v7a1.5 1.5 0 01-3 0v-7zm1.509 13.508a1.5 1.5 0 11-.001-2.999 1.5 1.5 0 01.001 2.999z" />
			</svg>
		),
	};

	const popupVariants = {
		open: {
			scale: 1,
			translateX: '-50%',
			opacity: 1,
			transition: { type: 'spring', damping: 15, stiffness: 300, restDelta: 0.001 },
		},
		closed: {
			scale: 0,
			opacity: 0,
			transition: { duration: 0.3, ease: 'easeInOut' },
		},
	};

	const popupKey = Date.now(); // Clave única para cada renderización

	return (
		<AnimatePresence>
			{popupState.visible && (
				<motion.div
					key={popupKey} // Clave única para reiniciar la animación
					initial="closed"
					animate="open"
					exit="closed"
					variants={popupVariants}
					className={alertClasses}
					id="popup"
					role="alert"
					style={{ top: 100, left: '50%', translateX: '-50%' }} // Ajustes de estilo para posicionamiento
				>
					<motion.div
						className="absolute h-[3px] bg-white top-0 left-0"
						initial={{ width: 0 }}
						animate={{ width: '100%' }}
						exit={{ width: 0 }}
						transition={{ duration: lifeTime, ease: 'easeOut', delay: 0.2 }}
					></motion.div>
					{icons[popupState.type]} {/* Muestra el icono correspondiente al tipo */}
					<p className="w-full mr-5">
						<span className="font-medium">{popupState.title}</span> <br />
						{popupState.message}
					</p>
					<div className="relative">
						<motion.a
							onClick={handleClose}
							className="w-3 h-3 absolute ml-2 mr-2 right-0 cursor-pointer"
							id="button"
							initial={{
								stroke: '#fff',
								fill: '#fff',
								strokeWidth: 2,
								opacity: 0.6,
							}}
							whileHover={{
								opacity: 1,
								scale: 1.3,
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

export default Popup;
