/* eslint-disable @typescript-eslint/explicit-function-return-type */
import '../styles/components/NavbarStyles.scss';

import { useStore } from '@nanostores/react';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

import NavButton from '../components/buttons/NavButton';
import { isMenuClosed, isMenuOpen } from '../hooks/pushBody'; //
import MenuIcon from './buttons/MenuIcon';

export default function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
	const [isColored, setIsColored] = useState(false);
	const $isMenuClosed = useStore(isMenuClosed);
	const $isMenuOpen = useStore(isMenuOpen);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 0);
			// set colored if scroll 70vh
			setIsColored(window.scrollY > window.innerHeight * 0.65);
			if (window.scrollY <= 0) {
				document.getElementById('main-container')?.classList.remove('pushed');
				isMenuOpen.set(false);
				isMenuClosed.set(true);
			}
		};

		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		// ejecutores
		handleScroll();
		handleResize();
		window.addEventListener('scroll', handleScroll);
		window.addEventListener('resize', handleResize);

		// Cleanup the event listeners on component unmount
		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	const shouldDisplayMenuIcon = isScrolled || isMobile;

	useEffect(() => {
		if (shouldDisplayMenuIcon && $isMenuClosed) {
			isMenuClosed.set(true);
		}
	}, [shouldDisplayMenuIcon]);

	const variants = {
		initial: {
			x: 200,
			opacity: 0,
		},
		animate: {
			x: 0,
			opacity: 1,
		},
	};

	const animationDelay = 0.2;

	return (
		<nav className={classNames('navbar', { menuBar: shouldDisplayMenuIcon }, { displayMenu: $isMenuOpen })}>
			<div className="navbar__container">
				<input
					type="checkbox"
					name="menu"
					id="menu"
					className="navbar__menu__checkbox"
					aria-label="menu"
					checked={$isMenuOpen}
					onChange={() => {
						$isMenuClosed
							? isMenuClosed.set(false)
							: setTimeout(() => {
									isMenuClosed.set(true);
							  }, 1200);
						if (!$isMenuOpen && shouldDisplayMenuIcon) {
							document.getElementById('main-container')?.classList.add('pushed');
						} else if ($isMenuOpen && shouldDisplayMenuIcon) {
							document.getElementById('main-container')?.classList.remove('pushed');
						}
						isMenuOpen.set(!$isMenuOpen);
					}}
				/>
				<label htmlFor="menu">
					<MenuIcon className={isColored && !$isMenuOpen ? `red` : ``} />
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
				<div className={classNames('navbar__menu')}>
					{['inicio', 'posts', 'blog', 'servicios', 'contacto'].map((id, idx) => (
						<NavButton
							href={`/${id}`}
							text={id.charAt(0).toUpperCase() + id.slice(1)}
							isAnimated={$isMenuClosed && shouldDisplayMenuIcon}
							key={idx}
							index={id}
							variants={variants}
							animate="animate"
							initial="initial"
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
						/>
					))}
					<div
						className={classNames('footer', {
							noAnimate: $isMenuClosed && shouldDisplayMenuIcon,
						})}
					></div>
				</div>
			</div>
		</nav>
	);
}
