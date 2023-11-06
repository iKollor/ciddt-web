/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useStore } from '@nanostores/react';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { animationFinished, chunkIndex } from '../../hooks/carrouselStores';

interface NavigationButtonsProps {
	Data: any[];
	className?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ Data, className }) => {
	const $chunkIndex = useStore(chunkIndex);
	const $animationFinished = useStore(animationFinished);
	const progressBarControls = useAnimation();
	const containerRef = useRef(null);

	useEffect(() => {
		const updateCircles = () => {
			// Remove the 'selected' class from all circles first
			document.querySelectorAll('.circle').forEach((circle) => {
				circle.classList.remove('selected');
			});

			// Add the 'selected' class to the circle that corresponds to the current index
			const activeCircle = document.getElementById(`circle-${$chunkIndex}`);
			if (activeCircle != null) {
				activeCircle.classList.add('selected');
			}
		};
		// Call the update function when the component mounts
		updateCircles();

		const unsubscribe = chunkIndex.subscribe(updateCircles);

		// Clean up the subscription when the component unmounts
		return () => {
			unsubscribe();
		};
	}, [$chunkIndex]); // Dependencies array includes $chunkIndex to re-run the effect when it changes

	const circleVariants = {
		hover: {
			scale: 1,
			textShadow: '0px 0px 8px #f8f8f8',
			boxShadow: '0px 0px 8px #f8f8f8',
		},
		selected: {
			backgroundColor: '#db001c',
			scale: 1.1,
			opacity: 1,
			textShadow: '0px 0px 8px #db001c',
			boxShadow: '0px 0px 8px #db001c',
		}, // Color y escala cuando está seleccionado
		unselected: { backgroundColor: '#f8f8f8', scale: 0.9, opacity: 0.8 }, // Color y escala en estado no seleccionado
	};

	const numberOfCircles = Math.ceil(Data.length / 3); // tamaño del chunk

	// Tiempo de espera antes de pasar al siguiente índice
	const intervalTime = 10000; // 10 segundos
	const intervalTimeSec = intervalTime / 1000;

	// Función para iniciar la animación de la barra de progreso
	const startProgressBarAnimation = () => {
		void progressBarControls.start({
			width: '100%',
			transition: {
				duration: intervalTimeSec + 1,
				ease: 'linear',
			},
		});
	};

	useEffect(() => {
		let indexInterval: number | NodeJS.Timeout | null | undefined = null;

		const startInterval = () => {
			// Reinicia la animación de la barra de progreso
			progressBarControls.set({ width: 0 });
			startProgressBarAnimation();

			// Establece el intervalo
			indexInterval = setInterval(() => {
				const nextIndex = ($chunkIndex + 1) % numberOfCircles;
				progressBarControls.set({ width: 0 }); // Reinicia la barra de progreso
				startProgressBarAnimation(); // Reinicia la animación de la barra de progreso
				chunkIndex.set(nextIndex); // Establece el siguiente índice
			}, intervalTime);
		};

		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry.isIntersecting) {
					startInterval();
				} else {
					// Si no está intersectando, limpia el intervalo
					if (indexInterval) {
						clearInterval(indexInterval);
					}
				}
			},
			{
				threshold: 1,
			},
		);

		if (containerRef.current) {
			observer.observe(containerRef.current);
		}

		// Limpieza: desconectar el observer y limpiar el intervalo
		return () => {
			if (containerRef.current) {
				observer.disconnect();
			}
			if (indexInterval) {
				clearInterval(indexInterval);
			}
		};
	}, [$chunkIndex]); // Dependencia en $chunkIndex para reiniciar la animación cuando cambie

	// Estilos para la barra de progreso
	const progressBarStyle = {
		height: '3px',
		backgroundColor: '#f8f8f8',
		width: '100%', // Establece el ancho completo para permitir la animación
		display: 'block', // 'block' para permitir que el ancho se aplique correctamente
		marginBottom: '10px',
	};

	return (
		<div ref={containerRef}>
			<motion.span
				className="line"
				style={progressBarStyle}
				initial={{ width: 0 }}
				animate={progressBarControls}
			/>
			<div className="circles">
				{Array.from({ length: numberOfCircles }, (_, index) => (
					<motion.span
						key={index}
						className={`circle ${className} ${!$animationFinished ? 'enable' : 'disable'} ${
							$chunkIndex === index ? 'selected' : 'unselected'
						}`}
						id={`circle-${index}`}
						variants={circleVariants}
						initial="unselected"
						whileHover="hover"
						animate={$chunkIndex === index ? 'selected' : 'unselected'}
						onClick={() => {
							chunkIndex.set(index);
							console.log(chunkIndex.get());
						}}
					/>
				))}
			</div>
		</div>
	);
};

export default NavigationButtons;
