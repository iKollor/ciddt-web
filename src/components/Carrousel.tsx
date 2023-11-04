/* eslint-disable @typescript-eslint/explicit-function-return-type */

import '../styles/components/Carrousel.scss';

import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { type Profile } from '../interfaces/Profile';
import { chunkIndex } from '../stores/userStore';
import ArrowIcon from './buttons/ArrowIcon';
import ProfileCard from './ProfileCard';

interface CarruselProps {
	profilesData: Profile[];
}

const Carrusel: React.FC<CarruselProps> = ({ profilesData }) => {
	const chunkSize = 3;
	const $chunkIndex = useStore(chunkIndex);
	const [currentChunkData, setCurrentChunkData] = useState(() => profilesData.slice(0, chunkSize));
	const [profileClasses, setProfileClasses] = useState(['estado1', 'estado2', 'estado3']);
	const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);

	const nextStep = () => {
		if (isButtonDisabled) return; // Prevenir múltiples clics si ya está deshabilitado
		setIsButtonDisabled(true); // Deshabilitar el botón inmediatamente al hacer clic

		const maxIndex = Math.ceil(profilesData.length / chunkSize) - 1;
		const newIndex = $chunkIndex + 1 > maxIndex ? 0 : $chunkIndex + 1;
		chunkIndex.set(newIndex);
		setCurrentChunkData(profilesData.slice(newIndex * chunkSize, (newIndex + 1) * chunkSize));

		setTimeout(() => {
			setIsButtonDisabled(false); // Rehabilita el botón después de un retraso
		}, 500);
	};

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

	const handleCardClick = (clickedIndex: number) => {
		// Estado inicial para todos los perfiles.
		const newProfileClasses = ['estado3', 'estado3', 'estado3'];

		// Asigna 'estado1' al perfil clickeado.
		newProfileClasses[clickedIndex] = 'estado1';

		// Determina los estados para los otros índices basados en el índice clickeado.
		switch (clickedIndex) {
			case 0:
				newProfileClasses[1] = 'estado2'; // El siguiente perfil será 'estado2'.
				// newProfileClasses[2] ya es 'estado3' por defecto.
				break;
			case 1:
				newProfileClasses[0] = 'estado3'; // El perfil anterior será 'estado3'.
				newProfileClasses[2] = 'estado2'; // El siguiente perfil será 'estado2'.
				break;
			case 2:
				newProfileClasses[0] = 'estado3'; // El perfil anterior será 'estado3'.
				newProfileClasses[1] = 'estado2'; // El otro perfil será 'estado2'.
				break;
			default:
				console.log('ups something gone wrong D:');
				// En caso de un índice inesperado, no cambiar ningún estado.
				break;
		}

		setProfileClasses(newProfileClasses);
		setLastClickedIndex(clickedIndex);
	};

	const updateProfileClasses = (currentProfiles: string | any[]) => {
		// Si hay tres perfiles, restablece solo los que estaban en 'hide'
		if (currentProfiles.length === 3) {
			setProfileClasses((prevClasses) => {
				// cls=class, idx=index
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
		setCurrentChunkData(profilesData.slice($chunkIndex * chunkSize, ($chunkIndex + 1) * chunkSize));
		updateProfileClasses(profilesData.slice($chunkIndex * chunkSize, ($chunkIndex + 1) * chunkSize));
	}, [$chunkIndex, lastClickedIndex]);

	return (
		<>
			<AnimatePresence initial={false} mode="wait">
				<motion.div
					className="carrusel__container"
					key={$chunkIndex}
					variants={variants}
					initial="initial"
					animate="animate"
					exit="exit"
				>
					{currentChunkData.map((profile, index) => (
						<ProfileCard
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
