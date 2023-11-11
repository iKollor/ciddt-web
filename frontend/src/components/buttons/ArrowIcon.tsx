/* eslint-disable @typescript-eslint/explicit-function-return-type */

import '../../styles/components/buttons/ArrowIcon.scss';

import { motion } from 'framer-motion';

interface ArrowIconProps {
	className?: string;
	onAnimationComplete?: () => void;
}

const ArrowIcon: React.FC<ArrowIconProps> = ({ className, onAnimationComplete }) => {
	const variants = {
		hover: {
			x: 5,
			stroke: '#db001c',
			transition: {
				x: {
					type: 'spring',
					damping: 15,
					stiffness: 300,
					restDelta: 0.001,
				},
				stroke: {
					ease: 'easeInOut',
					duration: 0.1,
				},
			},
		},
		clicked: {
			scale: 0.5,
		},
	};
	return (
		<>
			<motion.svg
				variants={variants}
				whileHover="hover"
				whileTap="clicked"
				fill="none"
				stroke="#fff"
				className={`arrowIcon ${className ?? ''}`}
				viewBox="0 0 24 24"
				onAnimationComplete={onAnimationComplete}
			>
				<path d="M9 18l6-6-6-6" />
			</motion.svg>
		</>
	);
};

export default ArrowIcon;
