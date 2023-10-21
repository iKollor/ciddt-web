/* eslint-disable @typescript-eslint/explicit-function-return-type */
import '../styles/components/NavbarStyles.scss';

import classNames from 'classnames';
import { useEffect, useState } from 'react';

import NavButton from '../components/buttons/NavButton';
import MenuIcon from './buttons/MenuIcon';

export const Navbar = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isFirstTimeMenuBar, setIsFirstTimeMenuBar] = useState(true);
	const [isColored, setIsColored] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 100);
			// set colored if scroll 70vh
			setIsColored(window.scrollY > window.innerHeight * 0.65);
			setIsFirstTimeMenuBar(window.scrollY > 0);
		};

		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768);
		};
		window.addEventListener('scroll', handleScroll);
		window.addEventListener('resize', handleResize);

		// Cleanup the event listeners on component unmount
		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	const shouldDisplayMenuBar = isScrolled || isMobile;

	useEffect(() => {
		if (shouldDisplayMenuBar && isFirstTimeMenuBar) {
			setIsFirstTimeMenuBar(true);
		}
	}, [shouldDisplayMenuBar]);

	return (
		<nav className={classNames('navbar', { menuBar: shouldDisplayMenuBar }, { displayMenu: isMenuOpen })}>
			<div className="navbar__container">
				<input
					type="checkbox"
					name="menu"
					id="menu"
					aria-label="menu"
					onChange={() => {
						setIsMenuOpen(!isMenuOpen);
						isFirstTimeMenuBar
							? setIsFirstTimeMenuBar(false)
							: setTimeout(() => {
									setIsFirstTimeMenuBar(true);
							  }, 1200);
						// body style overflow hidden
						document.body.style.overflow = isMenuOpen ? 'auto' : 'hidden';
					}}
				/>
				<label htmlFor="menu">
					<MenuIcon className={isColored && !isMenuOpen ? `red` : ``} />
				</label>
				<div className="navbar__logo">
					<a href="/">
						<img
							className={classNames('isotipo', { red: isColored })}
							src="/svg/isotipo_rojo.svg"
							alt="Isotipo de la marca"
						/>
						<img
							className={classNames('logo_texto', { red: isColored })}
							src="/svg/logo_text_rojo.svg"
							alt="CIDDT, Centro de Investigación y Defensa del Derecho al Trabajo"
						/>
					</a>
				</div>
				<div className={classNames('navbar__menu', { noAnimate: isFirstTimeMenuBar && shouldDisplayMenuBar })}>
					<NavButton
						href="/#home"
						text="Inicio"
						isAnimated={isFirstTimeMenuBar && shouldDisplayMenuBar}
						isSelected
					/>
					<NavButton href="/#posts" text="Posts" isAnimated={isFirstTimeMenuBar && shouldDisplayMenuBar} />
					<NavButton
						href="/#gallery"
						text="Galería"
						isAnimated={isFirstTimeMenuBar && shouldDisplayMenuBar}
					/>
					<NavButton
						href="/#contact"
						text="Contacto"
						isAnimated={isFirstTimeMenuBar && shouldDisplayMenuBar}
					/>
					<NavButton
						href="/#services"
						text="Servicios"
						isAnimated={isFirstTimeMenuBar && shouldDisplayMenuBar}
					/>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
