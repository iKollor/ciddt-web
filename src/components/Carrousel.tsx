/* eslint-disable @typescript-eslint/explicit-function-return-type */

import '../styles/components/Carrousel.scss';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import profilesData from '../../public/data/profiles.json';
import ArrowIcon from './buttons/ArrowIcon';
import ProfileCard from './ProfileCard';

const Carrusel: React.FC = () => {
	const [currentChunkIndex, setCurrentChunkIndex] = useState(0); // Índice del grupo actual de perfiles
	const profileRefs = useRef<Array<HTMLElement | null>>([]);
	const [profileClasses, setProfileClasses] = useState(['estado1', 'estado2', 'estado3']);
	const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);

	const chunkSize = 3;
	// Función para obtener el chunk actual basado en currentChunkIndex
	const getCurrentChunk = () => {
		const startIndex = currentChunkIndex * chunkSize;
		return profilesData.slice(startIndex, startIndex + chunkSize);
	};

	// Función para avanzar al siguiente grupo de perfiles
	const nextStep = () => {
		// Deshabilita el botón para prevenir clics adicionales
		setIsButtonDisabled(true);

		setCurrentChunkIndex((prevIndex) => {
			const maxIndex = Math.ceil(profilesData.length / chunkSize) - 1;
			console.log(currentChunkIndex);
			return prevIndex + 1 > maxIndex ? 0 : prevIndex + 1;
		});

		// Vuelve a habilitar el botón después de un delay
		setTimeout(() => {
			setIsButtonDisabled(false);
		}, 500);
	};

	const currentChunk = getCurrentChunk();

	const variants = {
		initial: {
			opacity: 0,
		},
		animate: {
			transition: {
				opacity: {
					duration: 0.5,
				},
			},
			opacity: 1,
			x: 0,
		},
		exit: {
			opacity: 0,
		},
	};

	const handleCardClick = (index: number) => {
		const newProfileClasses = [...profileClasses]; // Copia el estado actual
		// Asumiendo que 'estado1' es grande, 'estado2' es mediano y 'estado3' es pequeño
		if (index === 0) {
			newProfileClasses.splice(index, 1, 'estado1');
			newProfileClasses.splice(1, 1, 'estado2');
			newProfileClasses.splice(2, 1, 'estado3');
		} else if (index === 1) {
			newProfileClasses.splice(index, 1, 'estado1');
			newProfileClasses.splice(0, 1, 'estado2');
			newProfileClasses.splice(2, 1, 'estado3');
		} else {
			newProfileClasses.splice(index, 1, 'estado1');
			newProfileClasses.splice(0, 1, 'estado3');
			newProfileClasses.splice(1, 1, 'estado2');
		}
		setProfileClasses(newProfileClasses); // Actualiza el estado con las nuevas clases
		setLastClickedIndex(index);
	};

	// Modifica esta función para restablecer al estado por defecto para tres perfiles
	const updateProfileClasses = (currentProfiles: string | any[]) => {
		// Si hay tres perfiles, restablece solo los que estaban en 'hide'
		if (currentProfiles.length === 3) {
			setProfileClasses((prevClasses) => {
				return prevClasses.map((cls, idx) => {
					if (cls === 'hide') {
						// Asigna 'estado3' al último elemento si fue el último en ser oculto, sino 'estado2'
						return idx === 2 && lastClickedIndex !== null ? 'estado3' : 'estado2';
					}
					return cls;
				});
			});
		} else if (currentProfiles.length === 2) {
			setProfileClasses(['estado1', 'estado1', 'hide']);
		} else if (currentProfiles.length === 1) {
			setProfileClasses(['estado1', 'hide', 'hide']);
		}
	};

	useEffect(() => {
		const currentProfiles = getCurrentChunk();
		updateProfileClasses(currentProfiles);
	}, [currentChunkIndex]);

	return (
		<>
			<AnimatePresence initial={false} mode="wait">
				<motion.div
					className="carrusel__container"
					key={currentChunkIndex}
					variants={variants}
					initial="initial"
					animate="animate"
					exit="exit"
				>
					{currentChunk.map((profile, index) => (
						<ProfileCard
							ref={(el) => (profileRefs.current[index] = el)}
							key={index}
							profile={profile}
							index={index}
							state={profileClasses[index]}
							onClick={() => {
								handleCardClick(index);
							}}
						/>
					))}
				</motion.div>
			</AnimatePresence>
			<i
				className={`nextButton ${isButtonDisabled ? 'disabled' : ''}`}
				onClick={() => {
					if (!isButtonDisabled) {
						nextStep();
					}
				}}
			>
				<ArrowIcon />
			</i>
		</>
	);
};

export default Carrusel;
