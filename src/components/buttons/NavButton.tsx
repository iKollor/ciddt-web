import type React from 'react';
import classNames from 'classnames'; // Puedes usar esta librería para manejar clases condicionales
import '../../styles/components/buttons/ButtonStyles.scss'; // Suponiendo que has extraído los estilos a un archivo llamado `ButtonStyles.scss`

interface Props {
	text: string;
	href: string;
	isSelected?: boolean;
}

const NavButton: React.FC<Props> = ({ text, href, isSelected }) => {
	const buttonClass = classNames('button-container', {
		selected: isSelected,
	});

	return (
		<div className={buttonClass}>
			<a href={href}>{text}</a>
		</div>
	);
};

export default NavButton;
