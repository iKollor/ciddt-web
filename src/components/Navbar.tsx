import { useState, useEffect } from 'react';
import classNames from 'classnames';
import NavButton from './buttons/NavButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import '../styles/components/NavbarStyles.scss';

export const Navbar = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 100);
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

	return (
		<nav
			className={classNames(
				'navbar',
				{ menuBar: shouldDisplayMenuBar },
				{ displayMenu: isMenuOpen },
			)}
		>
			<input
				type='checkbox'
				name='menu'
				id='menu'
				aria-label='menu'
				onChange={() => {
					setIsMenuOpen(!isMenuOpen);
					console.log('Menu abierto');
				}}
			/>
			<label htmlFor='menu'>
				<FontAwesomeIcon icon={faBars} className='menu-icon' />
			</label>
			<div className='navbar__container'>
				<div className='navbar__logo'>
					<a href='/'>
						<img
							className='isotipo'
							src='/svg/isotipo_blanco.svg'
							alt='Isotipo de la marca'
						/>
						<img
							className='logo_texto'
							src='/svg/logo_texto_ciddt_blanco.svg'
							alt='CIDDT, Centro de Investigación y Defensa del Derecho al Trabajo'
						/>
					</a>
				</div>
				<div className='navbar__menu'>
					<NavButton href='/#home' text='INICIO' isSelected />
					<NavButton href='/#posts' text='POSTS' />
					<NavButton href='/#gallery' text='GALERÍA' />
					<NavButton href='/#contact' text='CONTACTO' />
					<NavButton href='/#services' text='SERVICIOS' />
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
