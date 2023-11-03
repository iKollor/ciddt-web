/* eslint-disable @typescript-eslint/explicit-function-return-type */

import '../styles/components/Carrousel.scss';

import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

import profilesData from '../../public/data/profiles.json';
import ProfileCard from './ProfileCard'; // Asegúrate de importar el nuevo componente

const Carrusel: React.FC = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [gridTemplateColumns, setGridTemplateColumns] = useState('16.67% 33.33% 50%');
	const [currentChunkIndex, setCurrentChunkIndex] = useState(0); // Índice del grupo actual de perfiles

	const determineState = (index: number): string => {
		switch (gridTemplateColumns) {
			case '50% 33.33% 16.67%':
				return index === 0 ? 'estado1' : index === 1 ? 'estado2' : 'estado3';
			case '16.67% 33.33% 50%':
				return index === 2 ? 'estado1' : index === 1 ? 'estado2' : 'estado3';
			case '16.67% 50% 33.33%':
				return index === 0 ? 'estado3' : index === 1 ? 'estado1' : 'estado2';
			default:
				return '';
		}
	};

	const chunkSize = 3;
	// Función para obtener el chunk actual basado en currentChunkIndex
	const getCurrentChunk = () => {
		const startIndex = currentChunkIndex * chunkSize;
		return profilesData.slice(startIndex, startIndex + chunkSize);
	};

	// Función para avanzar al siguiente grupo de perfiles
	const nextStep = () => {
		setCurrentChunkIndex((prevIndex) => {
			const maxIndex = Math.ceil(profilesData.length / chunkSize) - 1;
			return prevIndex + 1 > maxIndex ? 0 : prevIndex + 1;
		});
	};

	const currentChunk = getCurrentChunk();

	return (
		<>
			<motion.div layout className="carrusel__container" animate={{ gridTemplateColumns }} ref={containerRef}>
				{currentChunk.map((profile, index) => (
					<motion.div
						layout
						key={index}
						onClick={() => {
							index === 0
								? setGridTemplateColumns('50% 33.33% 16.67%')
								: index === 2
								? setGridTemplateColumns('16.67% 33.33% 50%')
								: setGridTemplateColumns('16.67% 50% 33.33%');
							console.log(index);
						}}
					>
						<ProfileCard profile={profile} index={index} state={determineState(index)} />
					</motion.div>
				))}
			</motion.div>
			<button style={{ position: 'absolute' }} className="nextButton" onClick={nextStep}>
				Siguiente
			</button>
		</>
	);
};

export default Carrusel;
