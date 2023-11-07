import '../../styles/components/buttons/ButtonStyles.scss'; // Suponiendo que has extraído los estilos a un archivo llamado `ButtonStyles.scss`

import classNames from 'classnames'; // Puedes usar esta librería para manejar clases condicionales
import { motion, type Transition, type VariantLabels, type Variants } from 'framer-motion';
import React from 'react';

interface Props {
	text: string;
	href: string;
	isSelected?: boolean;
	isAnimated?: boolean;
	variants?: Variants;
	initial?: VariantLabels;
	animate?: VariantLabels;
	transition?: Transition;
	key: string | number;
	index: string;
}

const NavButton: React.FC<Props> = ({
	text,
	href,
	isSelected = false,
	isAnimated,
	initial,
	animate,
	transition,
	variants,
	key,
	index,
}) => {
	const buttonClass = classNames('button-container', {
		selected: isSelected,
		noAnimate: isAnimated,
	});

	return (
		<motion.div
			className={buttonClass}
			initial={initial}
			animate={animate}
			transition={transition}
			variants={variants}
			key={key}
			id={index}
		>
			<a href={href}>{text}</a>
		</motion.div>
	);
};

export default NavButton;
