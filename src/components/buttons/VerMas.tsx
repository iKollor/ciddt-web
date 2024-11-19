import { motion } from 'framer-motion';

const colors = {
	text: '#0A0801',
	background: '#F0E7E0',
	primary: '#163330',
	secondary: '#CB9E50',
	accent: '#5D2A2C',
	inverse: '#f2cccf',
};

interface VerMasProps {
	opcion?: '1' | '2';
	textoBoton?: string;
	tamanoTexto?: string; // Ejemplo: '1.5rem'
	paddingBoton?: string; // Ejemplo: '15px 17px'
	href?: string;
	width?: string;
	className?: string;
}

function VerMas({
	opcion = '1',
	textoBoton = 'Ver Más',
	tamanoTexto = '1.5rem',
	paddingBoton = '15px 17px',
	href = '#',
	width = 'auto',
	className,
}: VerMasProps): JSX.Element {
	const estilosBase = {
		padding: paddingBoton,
		fontSize: tamanoTexto,
		borderRadius: '15px',
		fontWeight: 'bold',
		width,
	};

	const estilosOpcion = {
		1: {
			backgroundColor: colors.primary,
			color: colors.background + ' !important',
			boxShadow: 'none',
			'&:hover': {
				x: -5,
				y: -5,
				boxShadow: `5px 5px 0px ${colors.secondary}`,
			},
		},
		2: {
			backgroundColor: colors.background,
			boxShadow: 'none',
			color: colors.primary + ' !important',
			'&:hover': {
				x: -5,
				y: -5,
				backgroundColor: colors.background,
				boxShadow: `5px 5px 0px ${colors.secondary}`,
			},
		},
	};

	return (
		<>
			<motion.a
				href={href}
				style={{
					...estilosBase,
					backgroundColor: estilosOpcion[opcion].backgroundColor,
					color: estilosOpcion[opcion].color,
				}}
				className={className}
				whileHover={estilosOpcion[opcion]['&:hover']}
				transition={{
					type: 'spring',
					damping: 10,
					mass: 0.75,
					stiffness: 300,
				}}
			>
				{textoBoton}
			</motion.a>
		</>
	);
}

export default VerMas;
