import { auth } from '@firebase/client';
import { faClose, faPencil } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// eslint-disable-next-line import/no-unresolved
import { navigate } from 'astro:transitions/client';
import { getDoc } from 'firebase/firestore/lite';
import type { UserRecord } from 'firebase-admin/auth';
import React, { type ReactNode, useEffect, useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { popupStore } from 'src/hooks/popupStores';
import { loader } from 'src/hooks/pushBody';
import useTeamManagement from 'src/hooks/useTeamManagement';
import { type User } from 'src/interfaces/User';

import ImageLoader from './ImageLoader';
import { requestUserInput } from './InputPopup';
import Tooltip from './Tooltip';

interface Props {
	userRecord: UserRecord | null;
}

const EquipoTable: React.FC<Props> = ({ userRecord }) => {
	const [equipos, setEquipos] = useState<User[]>([]);
	const [hasTeam, setHasTeam] = useState<boolean>(false);
	const [isOwner, setIsOwner] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [teamId, setTeamId] = useState<string | null>(null);

	const {
		getTeamByUserId,
		createTeam,
		addMemberToTeam,
		validateTeamName,
		validateMemberId,
		isMemberAlreadyInTeam,
		isUserTeamOwner,
		getProfilesData,
		removeMemberFromTeam,
	} = useTeamManagement();

	useEffect(() => {
		const checkUserTeamOwner = async (): Promise<void> => {
			if (userRecord != null) {
				try {
					const team = await getTeamByUserId(userRecord.uid);
					if (team != null) {
						setTeamId(team.id);
						const teamSnap = await getDoc(team);
						if (teamSnap.exists()) {
							const teamId = teamSnap.id;
							setIsOwner(await isUserTeamOwner(userRecord.uid, teamId));
						}
					}
				} catch (error) {
					console.error(error);
					setIsOwner(false);
				}
			}
		};

		const checkUserTeam = async (): Promise<void> => {
			if (userRecord != null) {
				try {
					const team = await getTeamByUserId(userRecord.uid);
					setHasTeam(team !== null);
				} catch (error) {
					console.error(error);
					setHasTeam(false);
				}
			}
		};

		const setProfileData = async (): Promise<void> => {
			if (teamId == null) return;
			setIsLoading(true);
			try {
				const data = await getProfilesData(teamId);
				setEquipos(data);
				setIsLoading(false);
			} catch (error: any) {
				console.error(error);
				setIsLoading(false);
			}
		};

		void setProfileData();
		void checkUserTeam();
		void checkUserTeamOwner();
		return () => {
			setHasTeam(false);
		};
	}, [userRecord, teamId]);

	const handleCreateTeam = async (): Promise<void> => {
		if (userRecord == null) return;

		loader.set({
			isLoading: true,
			message: 'Creando Equipo...',
			type: 'infinite',
		});

		try {
			if ((await getTeamByUserId(userRecord.uid)) != null) {
				throw new Error('Ya tienes un equipo creado.');
			}
			const nombreEquipo = await requestUserInput(
				'text',
				'Nombre del equipo',
				'Ingrese el nombre del equipo',
				'Nombre del equipo inválido',
			);

			if (!validateTeamName(nombreEquipo)) {
				throw new Error(
					'Nombre del equipo inválido, debe tener al menos 5 caracteres sin caracteres especiales, ni números ni espacios',
				);
			}

			await createTeam(userRecord.uid, nombreEquipo);
			popupStore.set({
				visible: true,
				message: 'Equipo creado correctamente',
				type: 'success',
				title: 'Equipo creado',
			});
			await navigate('/ciddt-admin/settings');
		} catch (error: any) {
			popupStore.set({
				visible: true,
				message: error.message,
				type: 'danger',
				title: 'Error al crear el equipo',
			});
		} finally {
			loader.set({ ...loader.get(), isLoading: false });
		}
	};

	const handleAddMember = async (): Promise<void> => {
		if (userRecord == null) return;

		loader.set({
			isLoading: true,
			message: 'Añadiendo miembro...',
			type: 'infinite',
		});

		try {
			const team = await getTeamByUserId(userRecord.uid);
			if (team == null) {
				throw new Error('Primero debes crear un equipo.');
			}
			const id = await requestUserInput(
				'text',
				'Id del usuario',
				'Ingrese el id del usuario',
				'Id del usuario inválido o no existe',
			);

			if (!(await validateMemberId(id))) {
				throw new Error('Id del usuario inválido o no existe');
			}

			if (await isMemberAlreadyInTeam(team.id, id)) {
				throw new Error('El usuario ya es miembro del equipo.');
			}

			await addMemberToTeam(team.id, id);
			popupStore.set({
				visible: true,
				message: 'Miembro añadido correctamente',
				type: 'success',
				title: 'Miembro añadido',
			});
			setIsLoading(false);
			await navigate('/ciddt-admin/settings');
		} catch (error: any) {
			popupStore.set({
				visible: true,
				message: error.message,
				type: 'danger',
				title: 'Error al añadir el miembro',
			});
		} finally {
			loader.set({ ...loader.get(), isLoading: false });
		}
	};

	if (!hasTeam) {
		return (
			<div className="flex flex-col gap-4 items-center justify-center w-full h-full mt-4">
				<p className="text-white text-opacity-50">Aun no tienes un equipo creado</p>
				<button
					className="px-4 py-2 text-sm font-semibold text-white bg-edgewater-500 rounded-md hover:bg-edgewater-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-edgewater-500"
					onClick={() => {
						void handleCreateTeam();
					}}
				>
					Crear equipo
				</button>
			</div>
		);
	}

	const handleRemoveMember = async (userId: string): Promise<void> => {
		try {
			if (userRecord == null) return;
			if (teamId == null) return;
			setIsLoading(true);
			await removeMemberFromTeam(teamId, userId);
			popupStore.set({
				visible: true,
				message: 'Miembro eliminado correctamente',
				type: 'success',
				title: 'Miembro eliminado',
			});
			setIsLoading(false);
			await navigate('/ciddt-admin/settings');
		} catch (error: any) {
			console.error(error);
			popupStore.set({
				visible: true,
				message: error.message,
				type: 'danger',
				title: 'Error al eliminar el miembro',
			});
		}
	};

	const renderSkeleton = (): ReactNode => (
		<SkeletonTheme baseColor="#27474f" highlightColor="#559b81" height={20}>
			<tr className="border-b border-solid last:border-b-0 border-white border-opacity-20 transition-all duration-150 ease-in-out">
				<td className="pl-3 py-3">
					<div className="flex items-center space-x-4">
						<Skeleton height={30} width={30} />
						<div className="flex-grow">
							<Skeleton width="90%" />
						</div>
					</div>
				</td>
				<td>
					<Skeleton width="70%" />
				</td>
				<td>
					<Skeleton width="50%" />
				</td>
				<td>
					<Skeleton width="70%" />
				</td>
				<td>
					<Skeleton width="50%" />
				</td>
			</tr>
		</SkeletonTheme>
	);

	return (
		<>
			{/* Boton para crear un nuevo equipo */}
			<div className="flex justify-end mb-4">
				<button
					className="px-4 py-2 text-sm font-semibold text-white bg-edgewater-500 rounded-md hover:bg-edgewater-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-edgewater-500"
					onClick={() => {
						void handleAddMember();
					}}
				>
					Añadir miembro
				</button>
			</div>
			<div className="overflow-x-auto w-full overflow-y-hidden">
				<table className="w-full my-0 align-middle border-neutral-200">
					<thead className="align-bottom">
						<tr className="font-semibold text-sm text-white text-opacity-50">
							{/* Cabeceras ajustadas a las propiedades de Equipo */}
							<th className="pl-3 pb-2 text-start min-w-[120px] uppercase">Nombre</th>
							<th className="pb-2 text-start min-w-[80px] uppercase">Cargo</th>
							<th className="pb-2 text-center min-w-[50px] uppercase">Edad</th>
							<th className="pb-2 text-start min-w-[200px] uppercase">Detalles</th>
							<th className="pb-2 text-start min-w-[60px] uppercase">Acción</th>
						</tr>
					</thead>
					<tbody>
						{isLoading
							? // Muestra el esqueleto si los datos están cargando
								Array(5)
									.fill(null)
									.map((_, idx) => <React.Fragment key={idx}>{renderSkeleton()}</React.Fragment>)
							: equipos?.map((miembro, idx) => (
									<tr
										key={idx}
										className="border-b border-solid last:border-b-0 border-white border-opacity-20 hover:bg-edgewater-700 cursor-pointer transition-all duration-150 ease-in-out"
									>
										{/* Celda para la foto del perfil */}
										<td className="pl-3 py-3 rounded-tl-md rounded-bl-md max-w-[60px]">
											<div className="flex flex-row items-center gap-3">
												<ImageLoader
													src={
														miembro.urlFotoPerfil ??
														'/assets/images/profile_placeholder.jpg'
													}
													alt="Profile Picture"
													className="w-[30px] h-[30px] object-cover inline-block shrink-0 rounded-md"
													height={30}
													width={30}
												/>
												<h1>
													{miembro.displayName}{' '}
													{miembro.userId === auth.currentUser?.uid ? '(Tú)' : null}
												</h1>
											</div>
										</td>
										<td className="capitalize">{miembro.position}</td>
										<td className="text-center">{miembro.age ?? 'N/A'}</td>
										<td className="pr-3 max-w-[120px] truncate">
											<Tooltip
												content={miembro.details}
												children={<p className="truncate text-ellipsis">{miembro.details}</p>}
											/>
										</td>
										<td className="rounded-tr-md rounded-br-md">
											<div className="flex gap-4">
												{isOwner && (
													<>
														<button
															type="button"
															className="bg-edgewater-600 p-2 rounded-md hover:bg-edgewater-500 transition-all duration-200 ease-in-out flex justify-center"
														>
															<FontAwesomeIcon icon={faPencil} className="h-4 w-4" />
														</button>
														{miembro.userId === auth.currentUser?.uid ? null : (
															<button
																type="button"
																className="bg-edgewater-600 p-2 rounded-md hover:bg-edgewater-500 transition-all duration-200 ease-in-out  flex justify-center"
																onClick={() => {
																	void handleRemoveMember(miembro.userId);
																}}
															>
																<FontAwesomeIcon icon={faClose} className="h-4 w-4" />
															</button>
														)}
													</>
												)}
											</div>
										</td>
									</tr>
								))}
					</tbody>
				</table>
				{equipos.length === 0 && (
					<div className="flex items-center justify-center w-full h-full mt-4">
						<p className="text-white text-opacity-50">No tienes ningún miembro en tu equipo</p>
					</div>
				)}
			</div>
		</>
	);
};

export default EquipoTable;
