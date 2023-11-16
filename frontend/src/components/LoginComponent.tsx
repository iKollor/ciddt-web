/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { useStore } from '@nanostores/react';
import { loginWithEmail, loginWithFacebook } from '@shared/login';
import { useState } from 'react';

import { showPopup } from '../hooks/popupStores';
import { type ResponseCode } from '../interfaces/popUp';
import Popup from './buttons/Popup';

export const LoginComponent = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const $showPopup = useStore(showPopup);

	const [popupType, setPopupType] = useState<ResponseCode | undefined>(undefined);
	const [popupTitle, setPopupTitle] = useState('');
	const [popupMessage, setPopupMessage] = useState('');

	const handleLogin = (event: { preventDefault: () => void }) => {
		event.preventDefault();
		loginWithEmail(email, password)
			.then((response) => {
				setPopupType(response.type);
				setPopupTitle(response.title);
				setPopupMessage(response.message);
				showPopup.set(true);
			})
			.catch((error) => {
				console.log(error);
				// Aquí puedes manejar errores inesperados si es necesario
			});
	};

	const handleFacebookLogin = () => {
		loginWithFacebook()
			.then((response) => {
				setPopupType(response.type);
				setPopupTitle(response.title);
				setPopupMessage(response.message);
				showPopup.set(true);
			})
			.catch((error) => {
				console.log(error);
				// Aquí puedes manejar errores inesperados si es necesario
			});
	};

	return (
		<>
			<div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
				<form className="space-y-6" action="#" id="login-form" method="POST" onSubmit={handleLogin}>
					<div>
						<div className="flex items-center justify-between">
							<label htmlFor="email" className="block text-sm font-medium leading-6 text-gray">
								Email
							</label>
						</div>
						<div className="mt-2">
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
								onChange={(e) => {
									setEmail(e.target.value);
								}}
							/>
						</div>
					</div>

					<div>
						<div className="flex items-center justify-between">
							<label htmlFor="password" className="block text-sm font-medium leading-6 text-gray">
								Contraseña
							</label>
						</div>
						<div className="mt-2">
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
								onChange={(e) => {
									setPassword(e.target.value);
								}}
							/>
						</div>
					</div>

					<div>
						<button
							type="submit"
							className="flex w-full justify-center rounded-md bg-red px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition"
						>
							Iniciar Sesión
						</button>
					</div>
				</form>
				<div className="mt-10 text-center text-sm text-gray-500">
					<button
						className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition"
						id="fb-login-button"
						onClick={handleFacebookLogin}
					>
						<i className="fab fa-facebook-f mr-2"></i> Regístrate o Inicia Sesión con Facebook
					</button>
					<p className="text-gray text-sm mt-5 text-center">
						Antes de registrarse por primera vez por Facebook se enviara un correo al administrador
					</p>
				</div>
				{$showPopup && popupType !== undefined && (
					<Popup type={popupType} title={popupTitle} message={popupMessage} />
				)}
			</div>
		</>
	);
};
