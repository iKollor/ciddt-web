/* eslint-disable @typescript-eslint/explicit-function-return-type */
// Navbar.tsx
import FeatherIcon from 'feather-icons-react';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const Navbar: React.FC = () => {
	const navbarRef = useRef<HTMLDivElement>(null);
	const [constraints, setConstraints] = useState({ top: 0, right: 0, bottom: 0, left: 0 });

	useEffect(() => {
		const updateConstraints = () => {
			if (navbarRef.current != null) {
				const navbarRect = navbarRef.current.getBoundingClientRect();
				setConstraints({
					top: 0,
					right: window.innerWidth - navbarRect.width,
					bottom: window.innerHeight - navbarRect.height,
					left: 0,
				});
			}
		};

		// Actualiza las restricciones al montar y cuando cambie el tamaño de la ventana
		updateConstraints();
		window.addEventListener('resize', updateConstraints);

		return () => {
			window.removeEventListener('resize', updateConstraints);
		};
	}, []);

	// La posición inicial del navbar
	const initialPosition = { x: 0, y: 0 };

	return (
		<motion.nav
			ref={navbarRef}
			drag // Habilita el arrastre
			dragConstraints={constraints} // Restringe el arrastre al viewport
			dragElastic={0.5}
			dragTransition={{ timeConstant: 200, power: 0.2 }}
			initial={initialPosition}
			style={{
				position: 'fixed',
				top: '10px',
				left: '10px',
				boxShadow:
					'0px 1px 1px 0px rgba(0,0,0,0.08), 0px 2px 2px 0px rgba(0,0,0,0.12), 0px 4px 4px 0px rgba(0,0,0,0.16), 0px 8px 8px 0px rgba(0,0,0,0.2)',
				borderRadius: '8px',
				padding: '10px',
				overflow: 'auto', // Necesario para la propiedad resize
			}}
			className="bg-black text-white flex flex-col w-24 text-center"
		>
			<div className="cursor-grab h-8 flex justify-center">
				<FeatherIcon icon="more-horizontal" className="opacity-30" />
			</div>
			<ul className="list-none h-[200px] grid grid-rows-3 gap-2">
				<li className="flex items-center justify-center bg-slate-700 rounded-md">
					<a href="#" className="flex items-center justify-center h-full w-full">
						<FeatherIcon icon="home" />
					</a>
				</li>
				<li className="flex items-center justify-center hover:bg-slate-800 rounded-md transition-all cursor-pointer">
					<a href="#" className="flex items-center justify-center h-full w-full">
						<FeatherIcon icon="file-text" />
					</a>
				</li>
				<li className="flex items-center justify-center hover:bg-slate-800 rounded-md transition-all cursor-pointer">
					<a href="#" className="flex items-center justify-center h-full w-full">
						<FeatherIcon icon="settings" />
					</a>
				</li>
			</ul>
		</motion.nav>
	);
};

export default Navbar;
