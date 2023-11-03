/* eslint-disable @typescript-eslint/explicit-function-return-type */

import '../styles/components/AnchorNav.scss';

// eslint-disable-next-line import/no-named-as-default
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCallback, useEffect } from 'react';

gsap.registerPlugin(ScrollTrigger);

function AnchorNav() {
	useEffect(() => {}, []);
	const handleAnchorClick = useCallback(
		(e: { stopPropagation: () => void; currentTarget: { classList: { add: (arg0: string) => void } } }) => {
			// Detener propagación para evitar que otros manejadores de eventos interfieran
			e.stopPropagation();

			// Obtener todos los anchors
			const anchors = document.querySelectorAll('.anchorNav__container a');
			// Elimina la clase 'destacado' de cualquier otro anchor
			anchors.forEach((a) => {
				a.classList.remove('destacado');
			});

			// Añade la clase 'destacado' al anchor clickeado
			e.currentTarget.classList.add('destacado');
		},
		[],
	);

	return (
		<>
			<div className="anchorNav__container">
				<ul>
					<li className="anchorNav__buttons__container">
						<a href="#nosotros" onClick={handleAnchorClick}>
							Nosotros
						</a>
					</li>
					<li className="anchorNav__buttons__container">
						<a href="#equipo" onClick={handleAnchorClick}>
							Equipo
						</a>
					</li>
					<li className="anchorNav__buttons__container">
						<a href="#momentos" onClick={handleAnchorClick}>
							Momentos
						</a>
					</li>
					<li className="anchorNav__buttons__container">
						<a href="#servicios" onClick={handleAnchorClick}>
							Servicios
						</a>
					</li>
				</ul>
			</div>
		</>
	);
}

export default AnchorNav;
