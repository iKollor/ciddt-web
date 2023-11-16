/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { useStore } from '@nanostores/react';
import { registerNewUser } from '@shared/login';
import { useEffect, useState } from 'react';

import { showPopup } from '../hooks/popupStores';
import type { ResponseCode } from '../interfaces/popUp';
import Popup from './buttons/Popup';

function RegisterComponent() {
	const $showPopup = useStore(showPopup);

	const [popupType, setPopupType] = useState<ResponseCode | undefined>(undefined);
	const [popupTitle, setPopupTitle] = useState('');
	const [popupMessage, setPopupMessage] = useState('');

	const [formData, setFormData] = useState({ username: '', email: '', password: '' });

	// Cambia el manejador del evento para solo establecer formData
	const handleFormSubmit = (event: any) => {
		setFormData(event.detail);
	};

	useEffect(() => {
		// Añade el manejador del evento
		window.addEventListener('form-submitted', handleFormSubmit);

		// Limpieza del evento
		return () => {
			window.removeEventListener('form-submitted', handleFormSubmit);
		};
	}, []);

	useEffect(() => {
		if (formData.username !== '' && formData.email !== '' && formData.password !== '') {
			handleRegister(formData.username, formData.email, formData.password).catch((error) => {
				console.error(error);
				setPopupType('danger');
				setPopupTitle('Hubo un error inesperado');
				setPopupMessage(error.message);
				showPopup.set(true);
			});
		}
	}, [formData]);

	useEffect(() => {
		if (popupType === 'success' && !$showPopup) {
			const timer = setTimeout(() => {
				window.close();
			}, 1000);

			return () => {
				clearTimeout(timer);
			};
		}
	}, [popupType, $showPopup]);

	const handleRegister = async (username: string, email: string, password: string) => {
		const queryParams = new URLSearchParams(window.location.search);
		const registrationToken = queryParams.get('token'); // 'token' es el nombre del parámetro en la URL

		if (registrationToken !== null) {
			try {
				const response = await registerNewUser(registrationToken, username, email, password);
				setPopupType(response.type);
				setPopupTitle(response.title);
				setPopupMessage(response.message);
			} catch (error: any) {
				console.log(error);
				setPopupType('danger');
				setPopupTitle('Hubo un error inesperado');
				setPopupMessage(error.message);
			}
		} else {
			setPopupType('danger');
			setPopupTitle('Token es invalido');
			setPopupMessage('El token es invalido o incorrecto');
		}
		showPopup.set(true);
	};

	// El que revise este código, créanme que estoy haciendo esto por una razón xd
	const alpineButton = `<button :class="{'bg-red-400 hover:bg-red-700': isValid(), 'bg-gray-400 cursor-not-allowed': !isValid()}" :disabled="!isValid()" class="mt-3 text-lg font-semibold w-full text-white rounded-lg px-6 py-3 block shadow-xl transition">Register</button>`;

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	window.formValidator = function () {
		return {
			username: '',
			email: '',
			password: '',
			password_confirm: '',
			terms: false,
			isValid() {
				return (
					this.username !== '' &&
					this.email !== '' &&
					this.password === this.password_confirm &&
					this.password.length > 7 &&
					this.terms
				);
			},
		};
	};

	return (
		<>
			{/* xddd :P */}
			<div dangerouslySetInnerHTML={{ __html: alpineButton }} />
			{$showPopup && popupType !== undefined && (
				<Popup type={popupType} title={popupTitle} message={popupMessage} />
			)}
		</>
	);
}

export default RegisterComponent;
