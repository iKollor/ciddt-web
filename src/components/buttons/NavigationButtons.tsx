/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useStore } from '@nanostores/react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

import { chunkIndex } from '../../stores/userStore';

interface NavigationButtonsProps {
	Data: any[];
	className?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ Data, className }) => {
	const $chunkIndex = useStore(chunkIndex);

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

		// Set up a subscription to chunkIndex changes if you're using a state management library
		// Otherwise, you can rely on the $chunkIndex dependency to trigger the update
		// If you're using nanostores, it might look like this:
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

	const numberOfCircles = Math.ceil(Data.length / 3);

	return (
		<>
			<div className="circles">
				{Array.from({ length: numberOfCircles }, (_, index) => (
					<motion.span
						key={index}
						className={`circle ${className}`}
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
		</>
	);
};

export default NavigationButtons;
