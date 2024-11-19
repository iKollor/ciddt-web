import CopyToClipboard from '@components/buttons/CopyToClipboard';
import { auth } from '@firebase/client';
import { faClose, faPencil } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// eslint-disable-next-line import/no-unresolved
import { navigate } from 'astro:transitions/client';
import type { UserRecord } from 'firebase-admin/auth';
import React, { type ReactNode, useEffect, useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { popupStore } from 'src/hooks/popupStores';
import { loader } from 'src/hooks/pushBody';
import type { pseudoUser } from 'src/hooks/useEditProfileManagement';
import useTeamManagement from 'src/hooks/useTeamManagement';
import { previewImage, useTeamMemberEdit } from 'src/hooks/useTeamMemberEdit';

import EditProfileForm from './EditProfileForm';
import ImageLoader from './ImageLoader';
import { requestUserInput } from './InputPopup';
import Modal from './Modal';
import Tooltip from './Tooltip';

interface Props {
	userRecord: UserRecord | null;
}

interface TeamStateProps {
	equipos: pseudoUser[];
	hasTeam: boolean;
	isOwner: boolean;
	teamId: string | null;
	teamName: string;
}
const initialState = {
	equipos: [],
	hasTeam: false,
	isOwner: false,
	teamId: null,
	teamName: '',
};

const EquipoTable: React.FC<Props> = ({ userRecord }) => {
	const [teamState, setTeamState] = useState<TeamStateProps>(initialState);

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isModalEditOpen, setIsModalEditOpen] = useState(false);
	const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);

	const {
		getTeamByUserId,
		createTeam,
		validateTeamName,
		isUserTeamOwner,
		getProfilesData,
		removeMemberFromTeam,
		getTeamInfoById,
		editTeamName,
	} = useTeamManagement();

	useEffect(() => {
		if (userRecord == null) {
			setIsLoading(false);
			return;
		}

		const loadData = async (): Promise<void> => {
			try {
				setIsLoading(true);
				const team = await getTeamByUserId(userRecord.uid);
				if (team == null) {
					setTeamState((prev) => ({ ...prev, hasTeam: false }));
					return;
				}

				const teamInfo = await getTeamInfoById(team.id);
				const profiles = await getProfilesData(team.id);

				console.log(profiles);

				setTeamState({
					equipos: profiles,
					hasTeam: true,
					isOwner: await isUserTeamOwner(userRecord.uid, team.id),
					teamId: team.id,
					teamName: teamInfo.name,
				});
			} catch (error) {
				popupStore.set({
					visible: true,
					message: 'Error al cargar los datos del equipo',
					type: 'danger',
					title: 'Error al cargar los datos del equipo',
				});
			} finally {
				setIsLoading(false);
			}
		};

		void loadData();
	}, [userRecord]); // Dependencias ajustadas

	const handleCreateTeam = async (): Promise<void> => {
		if (userRecord == null) return;

		loader.set({
			isLoading: true,
			message: 'Creando Equipo...',
			type: 'infinite',
		});

		try {
			if ((await getTeamByUserId(userRecord.uid)) != null) {
				console.log('Ya tienes un equipo creado.');
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

	const handleRemoveMember = async (userId: string): Promise<void> => {
		try {
			if (userRecord == null) return;
			if (teamState.teamId == null) return;
			setIsLoading(true);
			await removeMemberFromTeam(teamState.teamId, userId);
			popupStore.set({
				visible: true,
				message: 'Miembro eliminado correctamente',
				type: 'success',
				title: 'Miembro eliminado',
			});
			setIsLoading(false);
			await navigate('/ciddt-admin/settings');
		} catch (error: any) {
			popupStore.set({
				visible: true,
				message: error.message,
				type: 'danger',
				title: 'Error al eliminar el miembro',
			});
		}
	};

	const handleEditMemberModal = async (miembro: pseudoUser): Promise<void> => {
		if (userRecord == null) return;

		useTeamMemberEdit.set(miembro);

		setIsModalEditOpen(true);
	};

	const handleAddMember = async (): Promise<void> => {
		if (userRecord == null) return;
		useTeamMemberEdit.set(null);
		previewImage.set(null);
		setIsModalCreateOpen(true);
	};

	const closeEditModal = (): void => {
		setIsModalEditOpen(false);
		previewImage.set(null);
		useTeamMemberEdit.set(null);
	};

	const closeCreateModal = (): void => {
		setIsModalCreateOpen(false);
		useTeamMemberEdit.set(null);
		previewImage.set(null);
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

	interface CreateTeamViewProps {
		onTeamCreate: () => void;
	}
	// Componente separado para la vista de creación de equipo
	const CreateTeamView: React.FC<CreateTeamViewProps> = ({ onTeamCreate }) => (
		<div className="flex flex-col gap-4 items-center justify-center w-full h-full mt-4">
			<p className="text-white text-opacity-50">Aun no tienes un equipo creado</p>
			<button
				className="px-4 py-2 text-sm font-semibold text-white bg-edgewater-500 rounded-md hover:bg-edgewater-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-edgewater-500"
				onClick={onTeamCreate}
			>
				Crear equipo
			</button>
		</div>
	);

	if (!teamState.hasTeam) {
		return (
			<CreateTeamView
				onTeamCreate={() => {
					void handleCreateTeam();
				}}
			/>
		);
	}

	const handleChangeTeamName = async (): Promise<void> => {
		try {
			const newName = await requestUserInput(
				'text',
				'Nuevo Nombre',
				'Ingrese el nuevo nombre del equipo',
				'Nombre inválido',
			);
			if (newName != null && validateTeamName(newName)) {
				void editTeamName(teamState.teamId ?? '', newName);
				popupStore.set({
					visible: true,
					message: 'Nombre del equipo cambiado correctamente',
					type: 'success',
					title: 'Nombre cambiado',
				});
				await navigate('/ciddt-admin/settings');
			} else {
				throw new Error('Nombre inválido, debe tener al menos 5 caracteres sin espacios');
			}
		} catch (error: any) {
			if (error.message === 'User closed popup') return;
			popupStore.set({
				visible: true,
				message: error.message,
				type: 'danger',
				title: 'Error al cambiar el nombre del equipo',
			});
		}
	};

	return (
		<>
			{/* Botón para crear un nuevo equipo */}
			<div className="flex justify-between mb-4 items-center">
				<div>
					<h1 className="font-bold text-2xl">Información del equipo</h1>
					<div className="flex gap-2 items-center">
						<p>
							<b>Nombre:</b> {teamState.teamName.charAt(0).toUpperCase() + teamState.teamName.slice(1)}
						</p>
						<FontAwesomeIcon
							icon={faPencil}
							className="cursor-pointer h-3 w-3"
							onClick={() => {
								void handleChangeTeamName();
							}}
						/>
					</div>
					<div className="flex gap-2 items-center">
						<p>
							<b>ID:</b> {teamState.teamId}
						</p>
						<CopyToClipboard text={teamState.teamId ?? ''} />
					</div>
				</div>
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
							: teamState.equipos?.map((miembro, idx) => (
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
													type="image"
												/>
												<h1>
													{miembro.displayName}{' '}
													{miembro.uid === auth.currentUser?.uid ? '(Tú)' : null}
												</h1>
											</div>
										</td>
										<td className="capitalize">{miembro.position ?? '---'}</td>
										<td className="text-center">{miembro.age ?? '---'}</td>
										<td className="pr-3 max-w-[120px] truncate">
											<Tooltip
												content={miembro.details ?? ''}
												children={
													<p className="truncate text-ellipsis">{miembro.details ?? '---'}</p>
												}
											/>
										</td>
										<td className="rounded-tr-md rounded-br-md">
											<div className="flex gap-4">
												{teamState.isOwner && (
													<>
														<button
															type="button"
															className="bg-edgewater-600 p-2 rounded-md hover:bg-edgewater-500 transition-all duration-200 ease-in-out flex justify-center"
															onClick={() => {
																void handleEditMemberModal(miembro);
															}}
														>
															<FontAwesomeIcon icon={faPencil} className="h-4 w-4" />
														</button>
														{miembro.uid === auth.currentUser?.uid ? null : (
															<button
																type="button"
																className="bg-edgewater-600 p-2 rounded-md hover:bg-edgewater-500 transition-all duration-200 ease-in-out  flex justify-center"
																onClick={() => {
																	void handleRemoveMember(miembro.uid);
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
				{teamState.equipos.length === 0 && (
					<div className="flex items-center justify-center w-full h-full mt-4">
						<p className="text-white text-opacity-50">No tienes ningún miembro en tu equipo</p>
					</div>
				)}
			</div>
			<Modal
				title="Edita la información del integrante"
				onClose={closeEditModal}
				isOpen={isModalEditOpen}
				width={450}
			>
				<EditProfileForm type="edit" />
			</Modal>
			<Modal title="Crea al nuevo integrante" onClose={closeCreateModal} isOpen={isModalCreateOpen} width={450}>
				<EditProfileForm type="create" teamId={teamState.teamId} />
			</Modal>
		</>
	);
};

export default EquipoTable;
