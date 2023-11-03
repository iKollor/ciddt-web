/* eslint-disable @typescript-eslint/explicit-function-return-type */

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
	state: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, index, state }) => {
	const soloNombre = profile.nombre.split(' ')[0];

	return (
		<div
			className={`profile__container ${state}`}
			key={index}
			style={{ backgroundImage: `url(/data/${profile.urlFotoPerfil})` }}
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
		</div>
	);
};

export default ProfileCard;
