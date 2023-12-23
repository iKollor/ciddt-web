import { auth, db } from '@firebase/client';
import { getUserAccessToken } from '@firebase/login';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { doc, getDoc, type Timestamp, updateDoc } from 'firebase/firestore';
import type { UserRecord } from 'firebase-admin/auth';
import React, { type FC, useEffect, useState } from 'react';
import { popupStore } from 'src/hooks/popupStores';
import type { UserPage } from 'src/interfaces/UserPages';

interface PagesTablesProps {
	userRecord: UserRecord;
}

const serverUrl = import.meta.env.PUBLIC_SERVER_URL;

const PagesTables: FC<PagesTablesProps> = ({ userRecord }) => {
	// TODO: get user pages from userRecord uid in firebase database

	const [pages, setPages] = useState<UserPage[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const fetchUserPages = async (): Promise<void> => {
			const userRef = doc(db, 'users', userRecord.uid, 'providers', 'facebook');
			const querySnapshot = await getDoc(userRef);

			const userPages: UserPage[] = [];
			// pages in firebase are store as an array object
			if (querySnapshot.data()?.pages != null) {
				querySnapshot.data()?.pages.forEach((page: any) => {
					userPages.push(page);
				});
			}
			setPages(userPages);
		};

		void fetchUserPages();
	}, [userRecord.uid]);

	async function userAccessToken(): Promise<void> {
		try {
			console.log('User has no access token');
			popupStore.set({
				title: 'Token no encontrado',
				message:
					'Token de acceso no encontrado, vuelve a iniciar sesión en Facebook, espera a que el popup se abra y presiona continuar',
				type: 'warning',
				visible: true,
			});
			if (auth.currentUser == null) return;
			const userAccessToken = await getUserAccessToken(auth.currentUser);
			const url = `${serverUrl}/facebook/createLongLivedToken/`;
			const body = {
				accessToken: userAccessToken,
				userId: userRecord.uid,
			};
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				console.error('Error fetching user access token');
				throw new Error('Error fetching user access token');
			}

			const data = await response.json();
			console.log(data);
			popupStore.set({
				title: 'Éxito',
				message: 'Token de acceso actualizado, intenta actualizar nuevamente',
				type: 'success',
				visible: true,
			});
		} catch {
			console.error('Error fetching user access token');
			popupStore.set({
				title: 'Error',
				message: 'Error al actualizar token de acceso',
				type: 'danger',
				visible: true,
			});
		}
	}

	const handleUpdatePages = async (): Promise<void> => {
		try {
			setIsLoading(true);
			// get user access token
			const userRef = doc(db, 'users', userRecord.uid, 'providers', 'facebook');
			const querySnapshot = await getDoc(userRef);

			const accessToken = querySnapshot.data()?.longLivedToken;
			const tokenExpiration = querySnapshot.data()?.longLivedTokenExpiresAt as Timestamp;

			if (accessToken == null || tokenExpiration?.toDate().getTime() < Date.now()) {
				await userAccessToken();
				setIsLoading(false);
				return;
			}

			console.log('Fetching user pages');
			const url = `https://graph.facebook.com/v18.0/me/accounts?fields=access_token,id,picture{url},name,link,instagram_business_account&access_token=${accessToken}`;
			const response = await fetch(url);
			const data = await response.json();

			if (data.error?.code === 190) {
				await userAccessToken();
				setIsLoading(false);
				return;
			}

			if (!response.ok) {
				console.error('Error fetching user pages');
				throw new Error('Error fetching user pages');
			}

			if (data.data.length === 0) {
				console.error('User has no pages');
				throw new Error('User has no pages');
			}

			const pages = data.data.map((page: any) => ({
				id: page.id,
				name: page.name,
				accessToken: page.access_token,
				picture: page.picture.data.url,
				account_type: 'facebook',
				link: page.link,
			})) as UserPage[];

			for (const page of data.data) {
				const instagramBusinessAccount = page.instagram_business_account;
				if (instagramBusinessAccount != null) {
					const instagramUrl = `https://graph.facebook.com/v11.0/${instagramBusinessAccount.id}?fields=name,ig_id,id,profile_picture_url,username&access_token=${accessToken}`;
					const instagramResponse = await fetch(instagramUrl);
					const instagramData = await instagramResponse.json();

					if (!instagramResponse.ok) {
						console.error('Error fetching instagram account');
						throw new Error('Error fetching instagram account');
					}

					pages.push({
						id: instagramBusinessAccount.id,
						name: instagramData.username,
						accessToken,
						picture: instagramData.profile_picture_url,
						account_type: 'instagram',
						link: `https://www.instagram.com/${instagramData.username}`,
					});
				}
			}

			await updateDoc(userRef, {
				pages,
			});
			setPages(pages);

			console.log('User pages updated');
			popupStore.set({
				title: 'Éxito',
				message: 'Páginas actualizadas',
				type: 'success',
				visible: true,
			});
			setIsLoading(false);
		} catch (error: any) {
			console.error('Error fetching user pages:', error);
			popupStore.set({
				title: 'Error',
				message: `Error al actualizar páginas: ${error.message}`,
				type: 'danger',
				visible: true,
			});
			setIsLoading(false);
			throw error;
		}
	};

	return (
		<>
			<div>
				<button
					onClick={() => {
						void handleUpdatePages();
					}}
					className="bg-edgewater-600 p-2 h-10 w-40 rounded-md hover:bg-edgewater-500 transition-all duration-200 ease-in-out px-3 mb-4 flex justify-center"
				>
					{isLoading ? (
						<FontAwesomeIcon icon={faSpinner} className="h-6 w-6 animate-spin" />
					) : (
						'Actualizar Páginas'
					)}
				</button>
			</div>
			<div className="overflow-x-auto w-full overflow-y-hidden">
				<table className="w-full my-0 align-middle border-neutral-200">
					<thead className="align-bottom">
						<tr className="font-semibold text-sm text-white text-opacity-50">
							<th className="pb-2 text-start min-w-[50px] uppercase">Página</th>
							<th className="pb-2 pl-3 text-start min-w-[50px] uppercase">Identificador de Página</th>
							<th className="pb-2 text-start min-w-[50px] uppercase">Tipo de Cuenta</th>
						</tr>
					</thead>
					<tbody>
						{pages?.map((page: UserPage, idx: number) => (
							<tr
								key={idx}
								className="border-b border-solid last:border-b-0 border-white border-opacity-20 hover:bg-edgewater-700 cursor-pointer transition-all duration-150 ease-in-out"
								onClick={() => window.open(page.link, '_blank')}
							>
								<td className="truncate rounded-tl-md rounded-bl-md">
									<div className="flex flex-row items-center gap-3">
										<img
											src={page.picture}
											alt="Profile"
											className="w-[30px] h-[30px] inline-block shrink-0 rounded-md"
										/>
										<h1>{page.name}</h1>
									</div>
								</td>
								<td className="p-3">{page.id}</td>
								<td className="capitalize rounded-tr-md rounded-br-md">{page.account_type}</td>
							</tr>
						))}
					</tbody>
				</table>
				{pages.length === 0 && (
					<div className="flex items-center justify-center w-full h-full mt-4">
						<p className="text-white text-opacity-50">No hay páginas disponibles</p>
					</div>
				)}
			</div>
		</>
	);
};

export default PagesTables;
