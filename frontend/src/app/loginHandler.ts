import { loginWithEmail, loginWithFacebook } from '../../../shared/login';

document.addEventListener('DOMContentLoaded', () => {
	const loginForm = document.getElementById('login-form');

	// Añadir tipo de retorno explícito a la función
	async function handleLogin(): Promise<void> {
		const email = (document.getElementById('email') as HTMLInputElement).value;
		const password = (document.getElementById('password') as HTMLInputElement).value;

		try {
			await loginWithEmail(email, password);
		} catch (error) {
			console.log(error);
		}
	}

	loginForm?.addEventListener('submit', (event) => {
		event.preventDefault();
		// Uso del operador void para manejar la promesa de forma explícita
		void handleLogin();
	});

	const fbLoginButton = document.getElementById('fb-login-button');

	// Añadir tipo de retorno explícito a la función
	async function handleFacebookLogin(): Promise<void> {
		try {
			await loginWithFacebook();
		} catch (error) {
			console.log(error);
		}
	}

	fbLoginButton?.addEventListener('click', () => {
		// Uso del operador void para manejar la promesa de forma explícita
		void handleFacebookLogin();
	});
});
