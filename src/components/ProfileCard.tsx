/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { motion } from 'framer-motion';
import { forwardRef, useEffect, useRef, useState } from 'react';

interface Profile {
	urlFotoPerfil: string;
	cargo: string;
	nombre: string;
	edad: number;
	detalles: string;
}

interface ProfileCardProps {
	profile: Profile;
	index: number;
	state?: string;
	onClick?: any;
	onLoad?: any;
	ref?: any;
}

const ProfileCard = forwardRef<HTMLDivElement, ProfileCardProps>(({ profile, index, state, onClick, onLoad }, ref) => {
	const soloNombre = profile.nombre.split(' ')[0];
	const [isOverflow, setIsOverflow] = useState(false);
	const nameRef = useRef<HTMLHeadingElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const getWidth = (stateClass: string | undefined) => {
		switch (stateClass) {
			case 'estado1':
				return '50%';
			case 'estado2':
				return '33.33%';
			case 'estado3':
				return '16.67%';
			default:
				return '33.33%'; // Un valor por defecto
		}
	};

	useEffect(() => {
		const container = containerRef.current;
		const nameElement = nameRef.current;

		if (container != null && nameElement != null) {
			// Esta es la función que verifica si hay desbordamiento
			const checkOverflow = () => {
				setIsOverflow(nameElement.scrollWidth > container.clientWidth);
			};

			// Crea un nuevo ResizeObserver que llame a checkOverflow cuando el contenedor cambie de tamaño
			const resizeObserver = new ResizeObserver(() => {
				checkOverflow();
			});

			// Inicia la observación
			resizeObserver.observe(container);

			// Asegúrate de desconectar el ResizeObserver cuando el componente se desmonte
			return () => {
				resizeObserver.disconnect();
			};
		}
	}, []); // Se ejecuta solo cuando el componente se monta

	return (
		<motion.div
			ref={ref}
			className={`profile__container ${state} ${isOverflow && state === 'estado3' ? 'rotate' : ''}`}
			key={index}
			style={{ backgroundImage: `url(/data/${profile.urlFotoPerfil})` }}
			onClick={onClick}
			onLoad={onLoad}
			initial={{ width: getWidth(state) }}
			animate={{ width: getWidth(state) }} // Ancho animado con Framer Motion
			transition={{
				width: {
					type: 'spring',
					damping: 15,
					stiffness: 100,
					restDelta: 0.001,
				},
			}}
		>
			<div ref={containerRef} className="profile__data">
				<div className="profile__position">
					<h3 className="position">{profile.cargo}</h3>
				</div>
				<div className="profile__name__age">
					<h1 ref={nameRef} className={`nombre ${isOverflow ? 'vertical' : ''}`}>
						{state === 'estado3' ? soloNombre : profile.nombre}
					</h1>
					<h1 className="edad">{profile.edad}</h1>
				</div>
				<div className="profile__details">{profile.detalles}</div>
			</div>
		</motion.div>
	);
});

export default ProfileCard;
