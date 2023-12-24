/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { useStore } from '@nanostores/react';
import { motion } from 'framer-motion';
import { forwardRef, useEffect, useRef, useState } from 'react';

import { animationFinished } from '../hooks/carrouselStores';
import { type User } from '../interfaces/User';

interface ProfileCardProps {
	profile: User;
	index: number;
	state?: string;
	onClick?: () => void;
	onLoad?: () => void;
	ref?: any; // me da pereza buscar el tipo
}

const ProfileCard = forwardRef<HTMLDivElement, ProfileCardProps>(({ profile, index, state, onClick, onLoad }, ref) => {
	const soloNombre = profile.displayName.split(' ')[0];
	const [isOverflow, setIsOverflow] = useState(false);
	const nameRef = useRef<HTMLHeadingElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const $animationFinished = useStore(animationFinished);

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

	const variants = {
		hover: { boxShadow: '0px 25px 50px 0px rgb(255, 255, 255, 0.08)' },
		initial: {
			x: 400,
			width: getWidth(state),
			opacity: 0,
		},
		animate: {
			x: 0,
			width: getWidth(state),
			pointerEvents: 'auto',
			opacity: 1,
		},
		exit: {
			x: -400,
			pointerEvents: 'none',
			opacity: 0,
		},
	};

	return (
		<motion.div
			ref={ref}
			className={`profile__container ${state} ${isOverflow && state === 'estado3' ? 'rotate' : ''}`}
			style={{
				backgroundImage: `url(${profile.urlFotoPerfil})` ?? 'url(/assets/images/profile_placeholder.jpg)',
			}}
			onClick={onClick}
			onLoad={onLoad}
			// @ts-expect-error
			variants={variants}
			initial="initial"
			animate="animate"
			exit="exit"
			whileHover="hover"
			onAnimationStart={() => {
				animationFinished.set(!$animationFinished);
			}}
			onAnimationEnd={() => {
				if ($animationFinished) {
					animationFinished.set(!$animationFinished);
				}
			}}
			onTap={() => {
				animationFinished.set($animationFinished);
			}}
			transition={{
				opacity: {
					delay: index * 0.1,
				},
				x: {
					delay: index * 0.1,
					type: 'spring',
					stiffness: 100,
					damping: 15,
				},
				width: {
					type: 'spring',
					damping: 15,
					stiffness: 100,
					restDelta: 0.001,
				},
				boxShadow: {
					ease: 'easeIn',
					duration: 0.15,
				},
			}}
		>
			<div ref={containerRef} className="profile__data">
				<div className="profile__position">
					<h3 className="position">{profile.position}</h3>
				</div>
				<div className="profile__name__age">
					<h1 ref={nameRef} className={`nombre ${isOverflow ? 'vertical' : ''}`}>
						{state === 'estado3' ? soloNombre : profile.displayName}
					</h1>
					<h1 className="edad">{profile.age}</h1>
				</div>
				<div className="profile__details">{profile.details}</div>
			</div>
		</motion.div>
	);
});

export default ProfileCard;
