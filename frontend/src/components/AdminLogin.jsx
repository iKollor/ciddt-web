import { useEffect } from 'react';
import axios from 'axios';

const appId = import.meta.env.PUBLIC_APP_ID;

window.statusChangeCallback = function (response) {
	if (response.status === 'connected') {
		// Aquí tienes el token de acceso y el ID de usuario
	} else {
		// Manejar casos donde el usuario no esté conectado o no haya dado permisos
	}
};

// Esta función también necesita ser global
window.checkLoginState = function () {
	FB.getLoginStatus(function (response) {
		window.statusChangeCallback(response);
	});
};

export const AdminLogin = () => {
	useEffect(() => {
		// Cargar el SDK de Facebook
		(function (d, s, id) {
			var js,
				fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {
				return;
			}
			js = d.createElement(s);
			js.id = id;
			js.src = 'https://connect.facebook.net/en_US/sdk.js';
			fjs.parentNode.insertBefore(js, fjs);
		})(document, 'script', 'facebook-jssdk');

		// Inicializar el SDK de Facebook
		window.fbAsyncInit = function () {
			FB.init({
				appId: appId, // Usa tu appId de Facebook
				cookie: true,
				xfbml: true,
				version: 'v18.0',
			});

			FB.AppEvents.logPageView();
		};
	}, []);

	// Añade un botón y maneja el inicio de sesión aquí
	const handleFBLogin = () => {
		FB.login(
			function (response) {
				if (response.authResponse) {
					console.log('Bienvenido! Fetching your information.... ');
					FB.api('/me?', { access_token: response.authResponse.accessToken }, function (response) {
						console.log('Good to see you, ' + response.name + '.');
					});
				} else {
					console.log('El usuario canceló el inicio de sesión o no autorizó completamente.');
				}
			},
			{ scope: 'pages_read_engagement, instagram_basic, pages_show_list' },
		);
	};

	return (
		<div>
			<button className="bg-blue hover:bg-dark_blue text-white font-bold py-2 px-4 rounded inline-flex items-center">
				<i className="fab fa-facebook-f mr-2"></i>
				Iniciar sesión con Facebook
			</button>
		</div>
	);
};
