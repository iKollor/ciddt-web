/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { motion } from 'framer-motion';
import { forwardRef, useEffect, useRef, useState } from 'react';
import type { pseudoUser } from 'src/hooks/useEditProfileManagement';

import { animationFinished } from '../hooks/carrouselStores';

interface ProfileCardProps {
	profile: pseudoUser;
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
	const [xOffset, setXOffset] = useState(0);
	const [yOffset, setYOffset] = useState(0);

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

	// TODO: hacer una animación hover en la tarjeta que haga que el boxShadow se mueva en base a la posición del mouse
	const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
		const { clientX, clientY } = event;

		const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
		const x = (clientX - left) / width - 0.5; // Normalizar posición x entre -0.5 y 0.5
		const y = (clientY - top) / height - 0.5; // Normalizar posición y entre -0.5 y 0.5

		const xOffset = x * 30; // Ajusta estos valores según el efecto deseado
		const yOffset = y * 30; // Ajusta estos valores según el efecto deseado
		setXOffset(xOffset);
		setYOffset(yOffset);
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
				className={`profile-container relative overflow-hidden cursor-grab flex items-end bg-[#2b2b28] text-white rounded-3xl ${state}`}
				onClick={onClick}
				onFocus={onClick}
				onSelect={onClick}
				onLoad={onLoad}
				// @ts-expect-error
				variants={variants}
				initial="initial"
				animate="animate"
				exit="exit"
				onMouseMove={handleMouseMove}
				whileHover={{
					boxShadow: `${xOffset}px ${yOffset}px 60px 0px rgba(255,255,255,0.3)`,
					transition: {
						boxShadow: {
							ease: 'linear',
							duration: 0,
						},
					},
				}}
				onAnimationStart={() => {
					animationFinished.set(true);
				}}
				onAnimationComplete={() => {
					animationFinished.set(false);
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
					filter: {
						ease: 'easeInOut',
						duration: 0.5,
					},
					boxShadow: {
						ease: 'easeOut',
						duration: 0.2,
					},
				}}
			>
				<div
					id="bg-img"
					className="absolute top-0 left-0 w-full h-full bg-center bg-cover"
					style={{
						backgroundImage:
							`url(${profile.urlFotoPerfil})` ?? 'url(/assets/images/profile_placeholder.jpg)',
					}}
				></div>
				<div
					className={`profile__data max-lg:text-left bg-gradient-to-t from-black p-5 pt-[100px] block relative w-full ${
						state === 'estado2' || state === 'estado3' ? 'text-center' : ''
					}${isOverflow ? 'h-full' : ''}`}
					style={{
						justifyContent: 'inherit',
					}}
				>
					<div className="profile__position max-lg:hidden">
						<h3
							className={`position font-normal text-lg opacity-50 leading-[1] ${
								state === 'estado3' ? 'hidden' : ''
							}`}
						>
							{profile.position}
						</h3>
					</div>
					<div
						className={`profile__name__age max-lg:text-3xl max-lg:-rotate-90 max-lg:justify-normal flex text-5xl font-extrabold items-start flex-row capitalize my-2 ${
							state === 'estado2' || state === 'estado3' ? 'justify-center' : ''
						}`}
					>
						<h1 ref={nameRef} className={`nombre ${isOverflow ? 'rotate-90' : ''} leading-[1]`}>
							{state === 'estado3' ? soloNombre : profile.displayName}
						</h1>
						{profile.age !== 0 && (
							<h1
								className={`edad ml-3 opacity-50 leading-[1] ${
									state === 'estado2' || state === 'estado3' ? 'hidden' : ''
								}`}
							>
								{profile.age}
							</h1>
						)}
					</div>
				</div>
			</motion.div>
		</>
	);
});

export default ProfileCard;
