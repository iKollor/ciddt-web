import '../../styles/components/buttons/ButtonStyles.scss'; // Suponiendo que has extraído los estilos a un archivo llamado `ButtonStyles.scss`

import classNames from 'classnames'; // Puedes usar esta librería para manejar clases condicionales
import React from 'react';

interface Props {
	text: string;
	href: string;
	isSelected?: boolean;
	isAnimated?: boolean;
}

const NavButton: React.FC<Props> = ({ text, href, isSelected = false, isAnimated }) => {
	const buttonClass = classNames('button-container', {
		selected: isSelected,
		noAnimate: isAnimated,
	});

	return (
		<div className={buttonClass}>
			<a href={href}>{text}</a>
		</div>
	);
};

export default NavButton;
