import { db } from '@firebase/client';
import { faClose, faPencil } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// eslint-disable-next-line import/no-unresolved
import { navigate } from 'astro:transitions/client';
import { doc, getDoc } from 'firebase/firestore';
import type { UserRecord } from 'firebase-admin/auth';
import React, { useEffect, useState } from 'react';
import { popupStore } from 'src/hooks/popupStores';
import { loader } from 'src/hooks/pushBody';
import useTeamManagement from 'src/hooks/useTeamManagement';
import { type User } from 'src/interfaces/User';

import { requestUserInput } from './InputPopup';
import Tooltip from './Tooltip';

interface Props {
	userRecord: UserRecord | null;
}

const EquipoTable: React.FC<Props> = ({ userRecord }) => {
	const [equipos, setEquipos] = useState<User[]>([]);
	const [hasTeam, setHasTeam] = useState<boolean>(false);
	const [isOwner, setIsOwner] = useState<boolean>(false);

	const {
		getTeamByUserId,
		createTeam,
		addMemberToTeam,
		validateTeamName,
		validateMemberId,
		isMemberAlreadyInTeam,
		isUserTeamOwner,
	} = useTeamManagement();

	useEffect(() => {
		const checkUserTeamOwner = async (): Promise<void> => {
			if (userRecord != null) {
				try {
					const team = await getTeamByUserId(userRecord.uid);
					if (team != null) {
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

		const fetchEquipos = async (): Promise<void> => {
			if (userRecord != null) {
				try {
					const team = await getTeamByUserId(userRecord.uid);
					if (team != null) {
						const teamMembers = await getDoc(team);
						if (teamMembers.exists()) {
							const membersID = teamMembers.data()?.members as string[];
							const members: User[] = [];
							for (const id of membersID) {
								const usersRef = doc(db, 'users', id);
								const userData = await getDoc(usersRef);
								if (userData.exists()) {
									const user = userData.data() as User;
									members.push({
										...user,
									});
									setEquipos(members);
								}
							}
						}
					}
				} catch (error: any) {
					console.error(error);
					setEquipos([]);
					popupStore.set({
						message: error.message,
						type: 'danger',
						visible: true,
						title: 'Error al cargar los miembros del equipo',
					});
				}
			}
		};

		void checkUserTeam();
		void fetchEquipos();
		void checkUserTeamOwner();
		return () => {
			setHasTeam(false);
		};
	}, [userRecord]);

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

			await addMemberToTeam(userRecord.uid, id);
			popupStore.set({
				visible: true,
				message: 'Miembro añadido correctamente',
				type: 'success',
				title: 'Miembro añadido',
			});
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
							<th className="pb-2 text-start min-w-[120px] uppercase">Nombre</th>
							<th className="pb-2 text-start min-w-[80px] uppercase">Cargo</th>
							<th className="pb-2 text-center min-w-[50px] uppercase">Edad</th>
							<th className="pb-2 text-start min-w-[200px] uppercase">Detalles</th>
							<th className="pb-2 text-start min-w-[60px] uppercase">Acción</th>
						</tr>
					</thead>
					<tbody>
						{equipos?.map((equipo, idx) => (
							<tr
								key={idx}
								className="border-b border-solid last:border-b-0 border-white border-opacity-20 hover:bg-edgewater-700 cursor-pointer transition-all duration-150 ease-in-out"
							>
								{/* Celda para la foto del perfil */}
								<td className="p-3 rounded-tl-md rounded-bl-md max-w-[60px]">
									<div className="flex flex-row items-center gap-3">
										<img
											src={equipo.urlFotoPerfil ?? '/assets/images/profile_placeholder.jpg'}
											alt="Profile Picture"
											className="w-[30px] h-[30px] inline-block shrink-0 rounded-md"
										/>
										<h1>{equipo.displayName}</h1>
									</div>
								</td>
								<td className="capitalize pl-6">{equipo.position}</td>
								<td className="text-center">{equipo.age ?? 'N/A'}</td>
								<td className="max-w-[200px] truncate">
									<Tooltip content={equipo.details} children={<div>{equipo.details}</div>} />
								</td>
								<td className="rounded-tr-md rounded-br-md">
									<div className="flex gap-4">
										{isOwner && (
											<button className="bg-edgewater-600 p-2 rounded-md hover:bg-edgewater-500 transition-all duration-200 ease-in-out flex justify-center">
												<FontAwesomeIcon icon={faPencil} className="h-4 w-4" />
											</button>
										)}
										<button className="bg-edgewater-600 p-2 rounded-md hover:bg-edgewater-500 transition-all duration-200 ease-in-out  flex justify-center">
											<FontAwesomeIcon icon={faClose} className="h-4 w-4" />
										</button>
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
