/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { motion } from 'framer-motion';
import { forwardRef } from 'react';

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
	const getWidth = (stateClass) => {
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
	// Asegúrate de que la clase 'state3' haga que la tarjeta se oculte o se vuelva muy pequeña
	return (
		<motion.div
			ref={ref}
			className={`profile__container ${state}`}
			key={index}
			style={{ backgroundImage: `url(/data/${profile.urlFotoPerfil})` }}
			onClick={onClick}
			onLoad={onLoad}
			initial={{ width: getWidth(state) }}
			animate={{ width: getWidth(state) }} // Ancho animado con Framer Motion
			transition={{
				width: {
					type: 'spring',
					damping: 10,
					stiffness: 100,
					restDelta: 0.001,
				},
			}}
		>
			<div className="profile__data">
				<div className="profile__position">
					<h3 className="position">{profile.cargo}</h3>
				</div>
				<div className="profile__name__age">
					<h1 className="nombre">{state === 'estado3' ? soloNombre : profile.nombre}</h1>
					<h1 className="edad">{profile.edad}</h1>
				</div>
				<div className="profile__details">{profile.detalles}</div>
			</div>
		</motion.div>
	);
});

export default ProfileCard;
