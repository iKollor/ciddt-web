// Puedes usar esta librería para manejar clases condicionales
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

interface Props {
	button: {
		href: string;
		name: string;
	};
	index: number;
}

const NavButton: React.FC<Props> = ({ button, index }) => {
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	// Definimos las variantes para la animación
	const underlineVariants = {
		initial: {
			x: '-100%',
		},
		hover: {
			x: 0,
		},
		exit: {
			x: '100%',
		},
	};
	return (
		<motion.div
			key={index}
			className="block overflow-hidden relative mx-4"
			onMouseEnter={() => {
				setHoverIndex(index);
			}}
			onMouseLeave={() => {
				setHoverIndex(null);
			}}
		>
			<a href={button.href} className="text-xl font-medium">
				{button.name}
			</a>
			<AnimatePresence>
				{hoverIndex === index && (
					<motion.div
						className="h-[1px] bg-white w-full absolute bottom-0 left-0"
						variants={underlineVariants}
						initial="initial"
						animate="hover"
						exit="exit"
						transition={{
							type: 'tween',
							duration: 0.4,
							ease: 'easeInOut',
						}}
						key={`underline-${index}`}
					/>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

export default NavButton;
