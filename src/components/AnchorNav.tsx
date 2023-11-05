/* eslint-disable @typescript-eslint/explicit-function-return-type */

import '../styles/components/AnchorNav.scss';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// style const
const COLORS = {
	negro: '#1d1d1b',
	blanco: '#f8f8f8',
};
const minScale = 0.8;
const maxScale = 1;

function AnchorNav() {
	const scrollMarkerRef = useRef(null);
	const { scrollYProgress } = useScroll({
		target: scrollMarkerRef,
		offset: ['end start', 'start start'],
	});
	const { scrollY } = useScroll();
	const scale = useTransform(scrollYProgress, [maxScale, minScale, 0], [maxScale, minScale, minScale]);
	const [textStrokeColor, setTextStrokeColor] = useState<string>();
	const [highlightedId, setHighlightedId] = useState<string | null>(null);
	const navRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const sections = Array.from(document.querySelectorAll<HTMLElement>('.section-container'));
		const checkOverlap = () => {
			const currentNav = navRef.current;
			if (currentNav == null) return;

			const navRect = currentNav.getBoundingClientRect();
			let newStrokeColor = COLORS.negro;
			let currentHighlightedId: string | null = null;

			for (const section of sections) {
				const isWhite = section.classList.contains('blanco');
				const isBlack = section.classList.contains('negro');
				const rect = section.getBoundingClientRect();
				const isOverlapping = !(
					navRect.right < rect.left ||
					navRect.left > rect.right ||
					navRect.bottom < rect.top ||
					navRect.top > rect.bottom
				);

				if (isOverlapping) {
					newStrokeColor = isWhite ? COLORS.negro : isBlack ? COLORS.blanco : newStrokeColor;
					if (currentHighlightedId == null) {
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
		};
	}, []); // If 'sections' is dynamic, it should be a dependency here

	return (
		<>
			<div // marcador invisible que ocupara todo el alto (100vh) al principio de la pantalla para medir el scroll
				ref={scrollMarkerRef}
				style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', pointerEvents: 'none' }}
			/>
			<motion.div className="anchorNav__container" ref={navRef} style={{ scale, transformOrigin: 'left bottom' }}>
				<ul>
					{['nosotros', 'equipo', 'momentos', 'servicios'].map((id) => (
						<li className="anchorNav__buttons__container" key={id}>
							<motion.a
								href={`#${id}`}
								style={{ WebkitTextStrokeColor: textStrokeColor }}
								className={highlightedId === id ? 'destacado' : ''}
							>
								{id.charAt(0).toUpperCase() + id.slice(1)}
							</motion.a>
						</li>
					))}
				</ul>
			</motion.div>
		</>
	);
}

export default AnchorNav;
