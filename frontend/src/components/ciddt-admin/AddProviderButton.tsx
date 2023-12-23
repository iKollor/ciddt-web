/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { auth } from '@firebase/client';
import { fbScopes } from '@firebase/login';
import { faCheckCircle, faCirclePlus, faCircleXmark, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FacebookAuthProvider, linkWithPopup, onAuthStateChanged, TwitterAuthProvider, unlink } from 'firebase/auth';
import { popupStore } from 'frontend/src/hooks/popupStores';
import React, { useEffect, useState } from 'react';

interface AddProviderButtonProps {
	provider: 'facebook' | 'twitter' | 'tiktok';
}

const AddProviderButton: React.FC<AddProviderButtonProps> = ({ provider }) => {
	const [isIntegrated, setIsIntegrated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isHover, setIsHover] = useState(false);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			if (currentUser != null) {
				const isProviderLinked = currentUser.providerData.some(
					(providerData) => providerData.providerId === `${provider}.com`,
				);
				setIsIntegrated(isProviderLinked);
			} else {
				setIsIntegrated(false);
			}
			setIsLoading(false);
		});

		return unsubscribe;
	}, [provider]);

	const handleLinkProvider = async () => {
		setIsLoading(true);
		if (auth.currentUser == null) {
			throw new Error('User is not logged in');
		}
		let providerInstance: any;
		let scopes;
		switch (provider) {
			case 'facebook':
				providerInstance = new FacebookAuthProvider();
				scopes = fbScopes;
				break;
			case 'twitter':
				providerInstance = new TwitterAuthProvider();
				scopes = ['users.read', 'tweet.read'];
				break;
			case 'tiktok':
				setIsLoading(false);
				throw new Error('TikTok is not supported yet');
			default:
				setIsLoading(false);
				throw new Error('Invalid provider');
		}
		scopes.forEach((scope) => providerInstance.addScope(scope));
		return await linkWithPopup(auth.currentUser, providerInstance);
	};

	const handleUnlinkProvider = async () => {
		setIsLoading(true);
		if (auth.currentUser == null) {
			throw new Error('User is not logged in');
		}
		await unlink(auth.currentUser, `${provider}.com`);

		setIsIntegrated(false);
		setIsLoading(false);
		setIsHover(false);
	};

	const handlePopup = (isSuccess: boolean, message: string) => {
		popupStore.set({
			visible: true,
			message,
			type: isSuccess ? 'success' : 'danger',
			title: isSuccess ? 'Operación Exitosa' : 'Error',
		});
	};

	const handleAsyncOperation = async () => {
		try {
			if (isIntegrated) {
				await handleUnlinkProvider();
				popupStore.set({
					visible: true,
					message: `Se ha desvinculado la cuenta correctamente de ${provider.toUpperCase()}`,
					type: 'info',
					title: 'Cuenta Desvinculada',
				});
			} else {
				const result = await handleLinkProvider();
				setIsIntegrated(true);
				setIsLoading(false);
				setIsHover(false);
				handlePopup(
					true,
					`Se ha vinculado la cuenta correctamente a ${result.providerId?.split('.')[0].toUpperCase()}`,
				);
			}
		} catch (error: any) {
			setIsLoading(false);
			setIsHover(false);
			handlePopup(false, error.message ?? 'Ocurrió un error desconocido');
		}
	};

	const handleClick = () => {
		void handleAsyncOperation();
	};

	if (isLoading) {
		return <FontAwesomeIcon icon={faSpinner} className="text-2xl h-6 w-6 animate-spin" />;
	}

	return (
		auth.currentUser != null && (
			<button
				onClick={handleClick}
				className="hover:scale-110 transition duration-300 ease-in-out focus:outline-none"
				onMouseEnter={() => {
					setIsHover(true);
				}}
				onMouseLeave={() => {
					setIsHover(false);
				}}
			>
				<FontAwesomeIcon
					icon={isIntegrated ? (isHover ? faCircleXmark : faCheckCircle) : faCirclePlus}
					className="text-2xl h-6 w-6"
				/>
			</button>
		)
	);
};

export default AddProviderButton;
