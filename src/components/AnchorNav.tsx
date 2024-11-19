/* eslint-disable @typescript-eslint/explicit-function-return-type */

import '../styles/components/AnchorNav.scss';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { locomotiveScroll } from 'src/layouts/locomotiveScroll';

// style const
const COLORS = {
	negro: '#1d1d1b',
	blanco: '#f8f8f8',
};
const minScale = 0.4;
const maxScale = 1;

function AnchorNav() {
	const scrollMarkerRef = useRef(null);
	const { scrollYProgress } = useScroll({
		target: scrollMarkerRef,
		offset: ['end start', 'start start'],
	});
	const { scrollY } = useScroll();
	const [textStrokeColor, setTextStrokeColor] = useState(COLORS.negro);
	const [highlightedId, setHighlightedId] = useState('');
	const navRef = useRef<HTMLDivElement>(null);
	const sections = Array.from(document.querySelectorAll<HTMLElement>('.section-container'));
	const scale = useTransform(scrollYProgress, [1, 0.5], [maxScale, minScale]);
	const scaleSpring = useSpring(scale, {
		stiffness: 100,
		damping: 15,
	});

	const lineHeightValue = useTransform(scrollYProgress, [0.9, 0.5], [0.8, 1.2]);
	const lineHeightValueSpring = useSpring(lineHeightValue, {
		stiffness: 100,
		damping: 15,
	});

	useEffect(() => {
		const updateScale = () => {
			// Fuerza un recalculo del progreso del desplazamiento y la escala
			const newScale = scale.get(); // Debería calcularse basándose en el nuevo progreso
			scaleSpring.set(newScale); // Aplica la escala actualizada al spring
		};

		// Forzar actualización después de que la página se haya cargado
		window.addEventListener('load', updateScale);
		updateScale(); // También invocamos directamente la función en caso de que la página ya esté cargada

		const checkOverlap = () => {
			const currentNav = navRef.current;
			if (currentNav == null) return;

			const navRect = currentNav.getBoundingClientRect();
			let newStrokeColor = COLORS.negro;
			let currentHighlightedId = '';

			for (const section of sections) {
				const isWhite = section.classList.contains('blanco');
				const isBlack = section.classList.contains('negro');
				const sectionRect = section.getBoundingClientRect();
				const isOverlapping = !(
					navRect.right < sectionRect.left ||
					navRect.left > sectionRect.right ||
					navRect.bottom < sectionRect.top ||
					navRect.top > sectionRect.bottom
				);
				if (isOverlapping) {
					newStrokeColor = isWhite ? COLORS.negro : isBlack ? COLORS.blanco : newStrokeColor;
					if (currentHighlightedId === '') {
						currentHighlightedId = section.id;
						break; // Si encontramos una sección superpuesta, no necesitamos seguir buscando
					}
				}
			}

			setTextStrokeColor(newStrokeColor);
			setHighlightedId(currentHighlightedId);
		};

		checkOverlap();

		const scrollListener = () => {
			requestAnimationFrame(checkOverlap);
		};

		scrollY.on('change', scrollListener);

		return () => {
			scrollY.clearListeners();
			window.removeEventListener('load', updateScale);
		};
	}, [scrollYProgress]);

	const variants = {
		initial: {
			x: -200,
			opacity: 0,
		},
		animate: {
			x: 0,
			opacity: 1,
		},
	};

	const animationDelay = 0.3;

	return (
		<>
			<div // marcador invisible que ocupara todo el alto (100vh) al principio de la pantalla para medir el scroll
				ref={scrollMarkerRef}
				style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', pointerEvents: 'none' }}
			/>
			<motion.div
				className="anchorNav__container"
				ref={navRef}
				initial={{ scale: 1 }}
				style={{
					marginBottom: 20,
					scale: scaleSpring,
					transformOrigin: 'left bottom',
					opacity: highlightedId === '' || highlightedId === 'footer' ? 0 : 1,
					pointerEvents: highlightedId === '' || highlightedId === 'footer' ? 'none' : 'auto',
				}}
				transition={{
					margin: {
						type: 'spring',
						stiffness: 100,
						damping: 15,
					},
				}}
			>
				<ul>
					{['nosotros', 'equipo', 'momentos', 'servicios'].map((id, idx) => (
						<motion.li
							className="anchorNav__buttons__container"
							key={id}
							variants={variants}
							initial="initial"
							animate="animate"
							transition={{
								x: {
									delay: 1 + idx * animationDelay,
									type: 'spring',
									stiffness: 100,
									damping: 15,
									restDelta: 0.001,
								},
								opacity: {
									delay: 1 + idx * animationDelay,
								},
							}}
						>
							<motion.a
								id={`anchor-${id}`}
								style={{
									WebkitTextStrokeColor: textStrokeColor,
									fontSize: highlightedId === id ? '7vw' : '3vw', // Aquí se asume que quieres una escala de 1 cuando está destacado
									lineHeight: lineHeightValueSpring,
									cursor: 'pointer',
								}}
								className={`${highlightedId === id ? 'destacado' : ''}`}
								transition={{
									fontSize: {
										type: 'spring',
										stiffness: 100,
										damping: 15,
										restDelta: 0.001,
										duration: 1,
									},
								}}
								data-scroll-to
								onClick={() => {
									scrollTo({
										target: `#${id}`,
										options: {},
									});
								}}
							>
								{id.charAt(0).toUpperCase() + id.slice(1)}
							</motion.a>
						</motion.li>
					))}
				</ul>
			</motion.div>
		</>
	);
}

export default AnchorNav;

function scrollTo(params: { target: number | HTMLElement | string; options: any }) {
	const { target, options } = params;
	locomotiveScroll.scrollTo(target, options);
}
