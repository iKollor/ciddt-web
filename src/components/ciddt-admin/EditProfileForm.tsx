import { auth } from '@firebase/client';
import { faInfoCircle, faPencil } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStore } from '@nanostores/react';
// eslint-disable-next-line import/no-unresolved
import { navigate } from 'astro:transitions/client';
import React, { type FC } from 'react';
import { popupStore } from 'src/hooks/popupStores';
import { loader } from 'src/hooks/pushBody';
import { createPseudoUserProfile, editProfileData, type pseudoUser } from 'src/hooks/useEditProfileManagement';
import useTeamManagement from 'src/hooks/useTeamManagement';
import { previewImage, useTeamMemberEdit } from 'src/hooks/useTeamMemberEdit';

import ImageLoader from './ImageLoader';
import { requestUserInput } from './InputPopup';
import Tooltip from './Tooltip';

interface ProfileForm {
	type: 'edit' | 'create';
	teamId?: string | null;
}

const EditProfileForm: FC<ProfileForm> = ({ type, teamId }) => {
	const useEditProfile = useStore(useTeamMemberEdit);
	const $previewImage = useStore(previewImage);

	const { addMemberToTeam } = useTeamManagement();

	const handleSubmitFormEditMember = async (e: React.FormEvent<HTMLFormElement>, userId: string): Promise<void> => {
		e.preventDefault();
		e.stopPropagation(); // Opcional: Detener la propagación del evento

		if (useEditProfile == null) return;
		loader.set({
			isLoading: true,
			message: 'Editando miembro...',
			type: 'infinite',
		});
		try {
			// get values from form
			const formData = new FormData(e.currentTarget);
			const displayName = formData.get('displayName') as string;
			const age = formData.get('age') as string;
			const position = formData.get('position') as string;
			const details = formData.get('details') as string;

			// validate values
			const displayNameRegex = /^[A-Za-záéíóúÁÉÍÓÚñÑ]+ [A-Za-záéíóúÁÉÍÓÚñÑ]+$/;
			const ageRegex = /^\d+$/;
			const positionRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{5,}$/;

			if (!displayNameRegex.test(displayName)) {
				throw new Error('Nombre y apellido inválidos');
			}

			if (age !== '') {
				if (!ageRegex.test(age) || Number(age) < 0 || Number(age) > 100) {
					throw new Error('Edad inválida');
				}
			}

			if (position !== '') {
				if (!positionRegex.test(position)) {
					throw new Error('Cargo inválido');
				}
			}

			if (details !== '') {
				if (details.length < 5) {
					throw new Error('Detalles inválidos');
				}

				if (details.length > 500) {
					throw new Error('Detalles demasiado largos');
				}
			}

			if (auth.currentUser != null) {
				const newPseudoUser: pseudoUser = {
					uid: userId,
					displayName,
					position,
					age: Number(age),
					details,
					profilePicture: previewImage.get(),
				};

				console.log(newPseudoUser);

				await editProfileData(userId, newPseudoUser);
				popupStore.set({
					visible: true,
					message: 'Miembro editado correctamente',
					type: 'success',
					title: 'Miembro editado',
				});
				await navigate('/ciddt-admin/settings');
			} else {
				throw new Error('La sesión ha expirado, por favor recarga la página o inicia sesión nuevamente');
			}
		} catch (error: any) {
			console.log(error);

			popupStore.set({
				visible: true,
				message: error.message,
				type: 'danger',
				title: 'Error al editar el miembro',
			});
		} finally {
			loader.set({ ...loader.get(), isLoading: false });
		}
	};

	const handleSubmitFormCreateMember = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		e.stopPropagation(); // Opcional: Detener la propagación del evento
		if (teamId == null) {
			throw new Error('Hubo un problema al leer el id del equipo. ¿Tienes un equipo creado?');
		}
		loader.set({
			isLoading: true,
			message: 'Creando miembro...',
			type: 'infinite',
		});
		try {
			// get values from form
			const formData = new FormData(e.currentTarget);
			const displayName = formData.get('displayName') as string;
			const age = formData.get('age') as string;
			const position = formData.get('position') as string;
			const details = formData.get('details') as string;

			// validate values
			const displayNameRegex = /^[A-Za-záéíóúÁÉÍÓÚñÑ]+ [A-Za-záéíóúÁÉÍÓÚñÑ]+$/;
			const ageRegex = /^\d+$/;
			const positionRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{5,}$/;

			if (!displayNameRegex.test(displayName)) {
				throw new Error('Nombre y apellido inválidos');
			}

			if (age !== '') {
				if (!ageRegex.test(age) || Number(age) < 0 || Number(age) > 100) {
					throw new Error('Edad inválida');
				}
			}

			if (position !== '') {
				if (!positionRegex.test(position)) {
					throw new Error('Cargo inválido');
				}
			}

			if (details !== '') {
				if (details.length < 5) {
					throw new Error('Detalles inválidos');
				}

				if (details.length > 500) {
					throw new Error('Detalles demasiado largos');
				}
			}

			if (auth.currentUser != null) {
				const pseudoUser: pseudoUser = {
					uid: `pseudo_${Date.now()}`,
					displayName,
					position,
					age: Number(age),
					details,
					profilePicture: $previewImage,
				};
				await createPseudoUserProfile(pseudoUser);
				await addMemberToTeam(teamId, pseudoUser.uid);
				popupStore.set({
					visible: true,
					message: 'Miembro creado correctamente',
					type: 'success',
					title: 'Miembro creado',
				});
				await navigate('/ciddt-admin/settings');
			} else {
				throw new Error('La sesión ha expirado, por favor recarga la página o inicia sesión nuevamente');
			}
		} catch (error: any) {
			popupStore.set({
				visible: true,
				message: error.message,
				type: 'danger',
				title: 'Error al crear el miembro',
			});
		} finally {
			loader.set({ ...loader.get(), isLoading: false });
		}
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault(); // Asegúrate de que esto está aquí también
				if (type === 'edit') {
					if (useEditProfile == null) return;
					void handleSubmitFormEditMember(e, useEditProfile.uid);
				}
				if (type === 'create') {
					void handleSubmitFormCreateMember(e);
				}
			}}
		>
			<div className="mb-6">
				<div className="flex items-center gap-4">
					<div className="relative">
						<picture>
							<ImageLoader
								src={
									$previewImage?.previewUrl ??
									useEditProfile?.urlFotoPerfil ??
									'/assets/images/profile_placeholder.jpg'
								}
								alt="Profile Picture"
								className="w-[100px] h-[100px] object-cover inline-block shrink-0 rounded-md"
								height={100}
								width={80}
								type="image"
							/>
						</picture>
						<div
							className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 bg-edgewater-800 bg-opacity-40 select-none"
							onClick={() => {
								requestUserInput(
									'image',
									false,
									'.jpg,.jpeg,.png',
									true,
									12 / 16,
									'Ajusta tu imagen',
									'Recuerda que la imagen que coloques aquí estará en la sección equipo de tu página',
								)
									.then((file) => {
										if (file != null && file instanceof File) {
											const reader = new FileReader();
											reader.readAsDataURL(file);
											reader.onloadend = () => {
												previewImage.set({
													file,
													previewUrl: reader.result as string,
												});
											};
										}
										popupStore.set({
											visible: true,
											message: 'Imagen cargada correctamente',
											type: 'success',
											title: 'Imagen cargada',
										});
									})
									.catch((error) => {
										popupStore.set({
											visible: true,
											message: error.message,
											type: 'danger',
											title: 'Error al cargar la imagen',
										});
									});
							}}
						>
							<FontAwesomeIcon icon={faPencil} />
						</div>
					</div>
					<div className="grid md:grid-cols-2 grid-cols-1 gap-6">
						<div className="relative">
							<input
								type="text"
								name="displayName"
								id="displayName"
								className="w-[130px] border-b bg-transparent border-b-gray-300 py-1 px-2 outline-none focus:border-b-edgewater-500 focus:border-b-[3px] valid:border-b-[3px] valid:border-b-edgewater-500 invalid:border-b-red-500 placeholder-shown:border-b transition-all duration-200 ease-in-out peer "
								required
								defaultValue={useEditProfile?.displayName}
								pattern="^[A-Za-záéíóúÁÉÍÓÚñÑ]+ [A-Za-záéíóúÁÉÍÓÚñÑ]+$"
								placeholder=" "
							/>
							<label
								htmlFor="displayName"
								className="text-white absolute left-2 top-1 cursor-text peer-focus:text-sm peer-focus:left-2 peer-focus:-top-3 transition-all duration-200 ease-in-out peer-valid:text-sm peer-valid:left-2 peer-valid:-top-3 peer-focus:text-edgewater-500 peer-valid:text-edgewater-500 peer-invalid:text-red-500 peer-invalid:text-sm peer-placeholder-shown:top-1 flex items-center w-[130px]"
							>
								Nombre y Apellido
								<Tooltip content="Solo incluir unicamente un nombre y un apellido. Ej: Juan Perez">
									<FontAwesomeIcon
										icon={faInfoCircle}
										width={12}
										height={12}
										className="h-3 w-3 ml-1 mb-1 cursor-default"
									/>
								</Tooltip>
							</label>
						</div>
						<div className="relative">
							<input
								type="number"
								name="age"
								id="age"
								className="w-full bg-transparent py-1 px-2 outline-none border-b-[3px] border-b-edgewater-500 transition-all duration-200 ease-in-out peer placeholder-shown:border-b-gray-300 placeholder-shown:border-b focus:border-b-edgewater-500 focus:border-b-[3px] invalid:border-b-red-500 invalid:border-b-[3px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
								min={0}
								max={100}
								defaultValue={useEditProfile?.age ?? ''}
								placeholder=" "
								pattern="\d+"
							/>
							<label
								htmlFor="age"
								className="absolute left-2 -top-3 text-sm text-edgewater-500 cursor-text transition-all duration-200 ease-in-out peer-focus:text-sm peer-focus:left-2 peer-focus:-top-3 peer-focus:text-edgewater-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-1 peer-placeholder-shown:text-white peer-invalid:text-red-500"
							>
								Edad
							</label>
						</div>
						<div className="md:col-span-2">
							<div className="relative">
								<input
									type="text"
									name="position"
									id="position"
									className="w-full bg-transparent py-1 px-2 outline-none border-b-[3px] border-b-edgewater-500 transition-all duration-200 ease-in-out peer placeholder-shown:border-b-gray-300 placeholder-shown:border-b focus:border-b-edgewater-500 focus:border-b-[3px] invalid:border-b-red-500 invalid:border-b-[3px]"
									defaultValue={useEditProfile?.position ?? ''}
									placeholder=" "
									pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{5,}"
								/>
								<label
									htmlFor="position"
									className="absolute left-2 -top-3 text-sm text-edgewater-500 cursor-text transition-all duration-200 ease-in-out peer-focus:text-sm peer-focus:left-2 peer-focus:-top-3 peer-focus:text-edgewater-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-1 peer-placeholder-shown:text-white peer-invalid:text-red-500"
								>
									Cargo
								</label>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div>
				<div className="relative">
					<textarea
						name="details"
						id="details"
						className="w-full bg-transparent p-3 outline-none border-[3px] border-edgewater-500 transition-all duration-200 ease-in-out peer placeholder-shown:border-gray-300 placeholder-shown:border focus:border-edgewater-500 focus:border-[3px] invalid:border-red-500 invalid:border-[3px] resize-none h-32 rounded-md"
						defaultValue={useEditProfile?.details ?? ''}
						placeholder=" "
					/>
					<label
						htmlFor="details"
						className="absolute left-2 -top-[10px] text-sm px-2 bg-edgewater-800 text-edgewater-500 cursor-text transition-all duration-200 ease-in-out peer-focus:text-sm peer-focus:left-2 peer-focus:-top-[10px] peer-focus:text-edgewater-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-0 peer-placeholder-shown:text-white peer-invalid:text-red-500 peer-focus:bg-edgewater-800 peer-focus:px-2 peer-focus:py-0 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-2 peer-placeholder-shown:py-3"
					>
						Detalles
					</label>
				</div>
			</div>
			<div className="flex justify-end mt-4">
				<button
					type="submit"
					className="px-4 py-2 text-sm font-semibold text-white bg-edgewater-500 rounded-md hover:bg-edgewater-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-edgewater-500"
				>
					Guardar
				</button>
			</div>
		</form>
	);
};

export default EditProfileForm;
