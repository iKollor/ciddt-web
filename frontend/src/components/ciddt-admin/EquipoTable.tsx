import { db } from '@firebase/client';
// eslint-disable-next-line import/no-unresolved
import { navigate } from 'astro:transitions/client';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import type { UserRecord } from 'firebase-admin/auth';
import { popupStore } from 'frontend/src/hooks/popupStores';
import { loader } from 'frontend/src/hooks/pushBody';
import type { Equipo } from 'frontend/src/interfaces/EquipoProfile';
import React, { useEffect, useState } from 'react';

import { requestUserInput } from './InputPopup';
import Tooltip from './Tooltip';

interface Props {
	userRecord: UserRecord | null;
}

const EquipoTable: React.FC<Props> = ({ userRecord }) => {
	const [equipos, setEquipos] = useState<Equipo[]>([]);
	const [hasTeam, setHasTeam] = useState<boolean>(false);

	// TODO: obtener el equipo del usuario actual de firebase
	const getEquipo = async (): Promise<Equipo[] | null> => {
		if (userRecord != null && equipos != null) {
			loader.set({
				isLoading: true,
				message: 'Obteniendo Equipo...',
				type: 'infinite',
			});
			try {
				console.log('Obteniendo Equipo...');
			} catch (error: any) {
				console.log(error);
			} finally {
				loader.set({ ...loader.get(), isLoading: false });
			}
		}
		return null;
	};

	const userHasTeam = async (uid: string): Promise<boolean> => {
		// verifica si el usuario ya tiene un equipo creado
		if (userRecord != null) {
			const userRef = doc(db, 'users', uid);
			const userSnap = await getDoc(userRef);
			if (userSnap.exists()) {
				const userData = userSnap.data();
				if (userData?.team != null) {
					return true;
				}
			}
			return false;
		} else {
			throw new Error('El usuario no existe');
		}
	};

	// TODO: crear una nueva colección llamada teams en firebase con un documento por cada equipo, un campo de tipo string con el nombre del equipo, un campo de referencia a al documento del usuario que creo el equipo. Ademas crear un nuevo campo en el usuario que lo creo llamado equipo con la referencia al nuevo equipo creado.
	const crearEquipo = async (): Promise<void> => {
		if (userRecord != null) {
			loader.set({
				isLoading: true,
				message: 'Creando Equipo...',
				type: 'infinite',
			});
			try {
				// verifica si el usuario ya tiene un equipo creado
				if (await userHasTeam(userRecord.uid)) {
					throw new Error('El usuario ya tiene un equipo creado');
				} else {
					console.log('Creando Equipo...');
					// crea el equipo
					const nombreEquipo = await requestUserInput(
						'Nombre del equipo', // placeholder
						'text', // type
						'Ingrese el nombre del equipo', // message
						'Nombre del equipo inválido', // errorMessage
					);
					if (!validarNombreEquipo(nombreEquipo)) {
						throw new Error(
							'Nombre del equipo inválido, debe tener al menos 5 caracteres sin caracteres especiales, ni números ni espacios',
						);
					}
					const formatNombreEquipo = nombreEquipo.charAt(0).toUpperCase() + nombreEquipo.slice(1);
					const teamRef = await addDoc(collection(db, 'teams'), {
						name: formatNombreEquipo,
						owner: userRecord.uid,
					});
					await updateDoc(doc(db, 'users', userRecord.uid), {
						team: teamRef,
					});
					popupStore.set({
						visible: true,
						message: 'Equipo creado correctamente',
						type: 'success',
						title: 'Equipo creado',
					});
					await navigate('/ciddt-admin/settings');
				}
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
		}
	};

	const validarNombreEquipo = (nombreEquipo: string): boolean => {
		// Expresión regular para validar el nombre del equipo
		// debe tener al menos 5 caracteres sin caracteres especiales, ni números ni espacios, pero si puede tener mayúsculas y minúsculas y tildes
		const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{5,}$/;
		return regex.test(nombreEquipo);
	};

	useEffect(() => {
		if (userRecord != null) {
			userHasTeam(userRecord.uid)
				.then((hasTeam) => {
					setHasTeam(hasTeam);
					console.log(hasTeam);
				})
				.catch((error) => {
					console.log(error);
				});
		}

		return () => {
			setHasTeam(false);
		};
	}, [userRecord]);

	if (!hasTeam) {
		return (
			<div className="flex flex-col gap-4 items-center justify-center w-full h-full mt-4">
				<p className="text-white text-opacity-50">Aun no tienes un equipo creado</p>
				<button
					className="px-4 py-2 text-sm font-semibold text-white bg-edgewater-500 rounded-md hover:bg-edgewater-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-edgewater-500"
					onClick={() => {
						void crearEquipo();
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
				<button className="px-4 py-2 text-sm font-semibold text-white bg-edgewater-500 rounded-md hover:bg-edgewater-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-edgewater-500">
					Añadir miembro
				</button>
			</div>
			<div className="overflow-x-auto w-full overflow-y-hidden">
				<table className="w-full my-0 align-middle border-neutral-200">
					<thead className="align-bottom">
						<tr className="font-semibold text-sm text-white text-opacity-50">
							{/* Cabeceras ajustadas a las propiedades de Equipo */}
							<th className="pb-2 text-start min-w-[60px] uppercase">Foto</th>
							<th className="pb-2 text-start min-w-[120px] uppercase">Nombre</th>
							<th className="pb-2 text-start min-w-[80px] uppercase">Cargo</th>
							<th className="pb-2 text-center min-w-[50px] uppercase">Edad</th>
							<th className="pb-2 text-start min-w-[200px] uppercase">Detalles</th>
						</tr>
					</thead>
					<tbody>
						{equipos?.map((equipo, idx) => (
							<tr
								key={idx}
								className="border-b border-solid last:border-b-0 border-white border-opacity-20 hover:bg-edgewater-700 cursor-pointer transition-all duration-150 ease-in-out"
								onClick={() => window.open(equipo.urlFotoPerfil.href, '_blank')}
							>
								{/* Celda para la foto del perfil */}
								<td className="p-3 rounded-md max-w-[60px]">
									<img
										src={equipo.urlFotoPerfil.href}
										alt="Foto del perfil"
										className="w-[50px] h-[50px] inline-block shrink-0 rounded-md"
									/>
								</td>
								{/* Celdas para nombre, cargo, edad y detalles */}
								<td className="max-w-[120px] truncate" title={equipo.nombre}>
									{equipo.nombre}
								</td>
								<td className="capitalize pl-6">{equipo.cargo}</td>
								<td className="text-center">{equipo.edad ?? 'N/A'}</td>
								<td className="max-w-[200px] truncate">
									<Tooltip content={equipo.detalles} children={<div>{equipo.detalles}</div>} />
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
