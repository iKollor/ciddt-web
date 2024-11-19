/* eslint-disable @typescript-eslint/explicit-function-return-type */

import '../styles/components/Carrousel.scss';

import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { pseudoUser } from 'src/hooks/useEditProfileManagement';
import useTeamManagement from 'src/hooks/useTeamManagement';

import { animationFinished, chunkIndex, selectedCard } from '../hooks/carrouselStores';
import ArrowIcon from './buttons/ArrowIcon';
import ProfileCard from './ProfileCard';

const teamId = import.meta.env.PUBLIC_TEAM_ID;

const Carrusel: React.FC = () => {
	const chunkSize = 3;
	const $chunkIndex = useStore(chunkIndex);
	const [profilesData, setProfilesData] = useState<pseudoUser[]>([]);
	const [currentChunkData, setCurrentChunkData] = useState(() => profilesData.slice(0, chunkSize));
	const [profileClasses, setProfileClasses] = useState(['estado1', 'estado2', 'estado3']);
	const $animationFinished = useStore(animationFinished);
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);

	const { getProfilesData } = useTeamManagement();

	useEffect(() => {
		if (teamId == null) return;
		void getProfilesData(teamId)
			.then((data) => {
				const profiles = data.slice(1);
				setProfilesData(profiles);
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);

	const nextStep = () => {
		if ($animationFinished || isButtonDisabled) return; // Prevenir múltiples clics si ya está deshabilitado

		setIsButtonDisabled(true); // Deshabilitar el botón
		setTimeout(() => {
			setIsButtonDisabled(false);
		}, 1400); // Habilitar el botón después de un tiempo

		const maxIndex = Math.ceil(profilesData.length / chunkSize) - 1;
		const newIndex = ($chunkIndex + 1) % (maxIndex + 1);
		chunkIndex.set(newIndex);
		setCurrentChunkData(profilesData.slice(newIndex * chunkSize, (newIndex + 1) * chunkSize));
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
	};

	const updateProfileClasses = (currentProfiles: string | any[]) => {
		// Si hay tres perfiles, restablece solo los que estaban en 'hide'
		if (currentProfiles.length === 3) {
			setProfileClasses((prevClasses) => {
				// cls=class, idx=index
				// [idx0, idx1, idx2]
				return prevClasses.map((cls, idx) => {
					if (cls === 'hide' && idx === 2) {
						return 'estado3';
					} else if (cls === 'hide' && idx === 1) {
						return 'estado2';
					}
					return cls;
				});
			});
		} else if (currentProfiles.length === 2) {
			setProfileClasses(['estado1', 'estado2', 'hide']);
		} else if (currentProfiles.length === 1) {
			setProfileClasses(['estado1', 'hide', 'hide']);
		}
	};

	// Este efecto se encarga de actualizar el trozo de datos actual
	// cuando el índice del trozo cambia.
	useEffect(() => {
		setCurrentChunkData(profilesData.slice($chunkIndex * chunkSize, ($chunkIndex + 1) * chunkSize));
	}, [$chunkIndex, profilesData, chunkSize]);

	// Este efecto se encarga de actualizar las clases de perfil
	// cuando el índice del trozo clickeado cambia.
	useEffect(() => {
		updateProfileClasses(profilesData.slice($chunkIndex * chunkSize, ($chunkIndex + 1) * chunkSize));
	}, [$chunkIndex, profilesData, chunkSize]);

	return (
		<>
			<AnimatePresence initial={false} mode="wait">
				<motion.div className="carrusel__container gap-6 flex w-full h-full pr-2" key={$chunkIndex}>
					{currentChunkData.map((profile, index) => (
						<ProfileCard
							key={index}
							profile={profile}
							index={index}
							state={profileClasses[index]}
							onClick={() => {
								handleCardClick(index);
								selectedCard.set(profile);
							}}
						/>
					))}
				</motion.div>
			</AnimatePresence>
			{profilesData.length > 3 && (
				<i
					className={`nextButton ${$animationFinished || isButtonDisabled ? 'disabled' : ''}`}
					onClick={nextStep}
				>
					<ArrowIcon />
				</i>
			)}
		</>
	);
};

export default Carrusel;
