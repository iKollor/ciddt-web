/* eslint-disable @typescript-eslint/explicit-function-return-type */
import '../../styles/components/buttons/MenuIcon.scss';

import { useRef, useState } from 'react';
import Velocity from 'velocity-animate';

export function HamburgerMenu({ className }: { className?: string }) {
	// Referencias a los elementos del DOM
	const McButtonRef = useRef<HTMLElement | null>(null); // botón completo (padre)
	const McBar1Ref = useRef<HTMLElement | null>(null); // barra 1 (hijo)
	const McBar2Ref = useRef<HTMLElement | null>(null); // barra 2 (hijo)
	const McBar3Ref = useRef<HTMLElement | null>(null); // barra 3 (hijo)

	// definición de estados
	const [isActive, setIsActive] = useState(false); // Estado para saber si el menu está activo o no
	const [isClickable, setIsClickable] = useState(true); // Estado para saber si el botón es clickeable o no
	const [isScaled, setIsScaled] = useState(false); // Estado para saber si el botón ya tiene la transformación de scaleX aplicada
	const [isTouchDevice, setIsTouchDevice] = useState(false); // Estado para saber si el dispositivo es táctil o no

	// Agrega y quita las transiciones de los elementos
	const setTransition = (element: HTMLElement | null) => {
		if (element != null) element.style.transition = 'all 0.3s ease-in-out';
	};

	const removeTransition = (element: HTMLElement | null) => {
		if (element != null) element.style.transition = 'background-color 0.3s ease-in-out'; // se deja la transición de background-color ya que se usa después
	};

	// Verifica si el dispositivo es táctil
	const handleTouchStart = () => {
		setIsTouchDevice(true);
	};

	// Agrega y quita la transformación de scaleX
	const handleEnter = () => {
		// Apply scaleX transformation to McButtonRef
		if (!isScaled && !isTouchDevice && !isActive) {
			setTransition(McButtonRef.current);
			if (McButtonRef.current != null) McButtonRef.current.style.transform += ' scaleX(1.4)';
			setIsScaled(true); // Estado para evitar que se aplique una y otra vez la transformación
		}
		// Apply scaleX transformation to the children of McButtonRef
		if (!isScaled && !isTouchDevice && isActive) {
			if (McButtonRef.current != null) {
				const children = Array.from(McButtonRef.current.children) as HTMLElement[];
				for (let i = 0; i < children.length; i++) {
					setTransition(children[i]);
					children[i].style.transform += ' scaleX(1.4)';
				}
			}
			setIsScaled(true); // Estado para evitar que se aplique una y otra vez la transformación
		}
	};

	// Quita la transformación de scaleX
	const handleLeave = () => {
		const scaleXRegex = /scaleX\(1\.4\)/; // Expresión regular para buscar la transformación de scaleX

		// Remove scaleX transformation from McButtonRef
		if (
			McButtonRef.current != null &&
			McButtonRef.current.style.transform.includes('scaleX(1.4)') &&
			!isTouchDevice
		) {
			McButtonRef.current.style.transform = McButtonRef.current.style.transform.replace(scaleXRegex, '').trim();
		}
		// Remove scaleX transformation from each children of McButtonRef
		if (McButtonRef.current != null) {
			const children = Array.from(McButtonRef.current.children) as HTMLElement[];
			for (let i = 0; i < children.length; i++) {
				if (children[i].style.transform.includes('scaleX(1.4)')) {
					children[i].style.transform = children[i].style.transform.replace(scaleXRegex, '').trim();
				}
			}
		}

		setIsScaled(false); // Se indica que la transformación ya no está aplicada
	};

	const handleClick = () => {
		// Remover transiciones al hacer click
		removeTransition(McButtonRef.current);
		removeTransition(McBar1Ref.current);
		removeTransition(McBar2Ref.current);
		removeTransition(McBar3Ref.current);

		// Verificar si el botón es clickeable
		if (!isClickable) return;
		// Cambiar el estado del botón
		setIsActive(!isActive);

		if (!isActive) {
			// menu cerrado
			Velocity(McBar1Ref.current, { top: '50%' }, { duration: 200, easing: 'swing' });

			Velocity(McBar3Ref.current, { top: '50%' }, { duration: 200, easing: 'swing' });

			Velocity(McBar3Ref.current, { rotateZ: '90deg' }, { duration: 800, delay: 200, easing: [500, 20] });

			Velocity(McButtonRef.current, { rotateZ: '135deg' }, { duration: 800, delay: 200, easing: [500, 20] });
		} else {
			// menu abierto
			Velocity(McButtonRef.current, 'reverse');

			Velocity(McBar3Ref.current, { rotateZ: '0deg' }, { duration: 800, easing: [500, 20] });

			Velocity(McBar3Ref.current, { top: '100%' }, { duration: 200, easing: 'swing' });

			Velocity(McBar1Ref.current, 'reverse', { delay: 800 });
		}

		// Hacer el botón inclickeable para evitar comportamientos no deseados
		setIsClickable(false);
		setTimeout(() => {
			setIsClickable(true);
		}, 1200); // tiempo estimado de la animación
	};

	return (
		<b
			className={`McButton ${isActive ? 'active' : ''} ${className}`}
			onClick={handleClick}
			ref={McButtonRef}
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
			onTouchStart={handleTouchStart}
			style={{
				// Evita que se pueda hacer click en el botón mientras se está animando
				cursor: isClickable ? 'pointer' : 'default',
				pointerEvents: isClickable ? 'auto' : 'none',
			}}
		>
			<b ref={McBar1Ref}></b>
			<b ref={McBar2Ref}></b>
			<b ref={McBar3Ref}></b>
		</b>
	);
}

export default HamburgerMenu;
