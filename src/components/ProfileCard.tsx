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

	// TODO: hacer una animación hover en la tarjeta que haga que el boxshadow se mueva en base a la posición del mouse
	const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
		const { clientX, clientY } = event;

		// No es necesario hacer un casting aquí, ya que el tipo de evento es específico de React
		const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
		const x = (clientX - left) / width - 0.5; // Normalizar posición x entre -0.5 y 0.5
		const y = (clientY - top) / height - 0.5; // Normalizar posición y entre -0.5 y 0.5

		const xOffset = x * 30; // Ajusta estos valores según el efecto deseado
		const yOffset = y * 30; // Ajusta estos valores según el efecto deseado

		event.currentTarget.style.boxShadow = `${xOffset}px ${yOffset}px 60px 0px rgba(255,255,255,0.2)`;
		event.currentTarget.style.transition = 'none';
	};

	const variants = {
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
		<>
			<motion.div
				ref={ref}
				className={`relative overflow-hidden cursor-grab flex items-end bg-white text-white rounded-3xl ${state} ${
					isOverflow && state === 'estado3' ? 'rotate-90' : ''
				}${
					state === 'estado0'
						? 'w-full'
						: state === 'estado1'
							? 'w-1/2'
							: state === 'estado2'
								? 'w-1/3 blur-sm'
								: state === 'estado3'
									? 'w-1/6 blur-lg'
									: ''
				}
				`}
				onClick={onClick}
				onLoad={onLoad}
				// @ts-expect-error
				variants={variants}
				initial="initial"
				animate="animate"
				exit="exit"
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
				onMouseEnter={(e) => (e.currentTarget.style.transition = 'box-shadow 0.15s ease-in')}
				onMouseMove={handleMouseMove}
				onMouseLeave={(e) => {
					e.currentTarget.style.boxShadow = '';
					e.currentTarget.style.transition = 'box-shadow 0.2s ease-out';
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
				}}
			>
				<motion.div
					id="bg-img"
					className="absolute top-0 left-0 w-full h-full bg-center bg-cover"
					style={{
						backgroundImage:
							`url(${profile.urlFotoPerfil})` ?? 'url(/assets/images/profile_placeholder.jpg)',
						filter: 'grayscale(100%) contrast(0.8)',
					}}
				></motion.div>
				<div className="profile__data bg-gradient-to-t from-black p-5 pt-[100px] block relative w-full">
					<div className="profile__position">
						<h3 className="position font-normal text-lg opacity-50 leading-[1]">{profile.position}</h3>
					</div>
					<div className="profile__name__age flex text-5xl font-extrabold items-start flex-row capitalize">
						<h1 ref={nameRef} className={`nombre ${isOverflow ? 'rotate-90' : ''}`}>
							{state === 'estado3' ? soloNombre : profile.displayName}
						</h1>
						<h1 className="edad ml-4 opacity-50">{profile.age}</h1>
					</div>
					<div className="profile__details text-lg font-light">{profile.details}</div>
				</div>
			</motion.div>
		</>
	);
});

export default ProfileCard;
