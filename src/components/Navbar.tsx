import '../styles/components/buttons/Hamburguer.scss';

import { faClock } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import image1 from '@public/data/profiles/jim.jpeg';
import image2 from '@public/data/profiles/joy.jpeg';
import image3 from '@public/data/profiles/marie.jpeg';
import { AnimatePresence, motion } from 'framer-motion';
import { type FC, useEffect, useRef, useState } from 'react';

interface NavbarProps {
	buttons: Array<{
		name: string;
		href: string;
	}>;
}

const LAYER_DELAYS = {
	firstLayer: { open: 0, close: 0.5 },
	secondLayer: { open: 0.3, close: 0.3 },
	thirdLayer: { open: 0.7, close: 0 },
};

const images = [image1, image2, image3];

const Navbar: FC<NavbarProps> = ({ buttons }) => {
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const [time, setTime] = useState(new Date());
	const [isScrolled, setIsScrolled] = useState(false);
	const menuButton = useRef<HTMLDivElement | null>(null);
	const [isMenuActive, setIsMenuActive] = useState(false);
	const [imageSrc, setImageSrc] = useState(images[0]);

	useEffect(() => {
		let animationFrameId: number;

		const update = (): void => {
			const now = new Date();
			const nextUpdate = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
				now.getHours(),
				now.getMinutes() + 1,
				0,
				0,
			);
			const delay = nextUpdate.getTime() - now.getTime();

			setTimeout(() => {
				setTime(new Date());
				requestAnimationFrame(update);
			}, delay);
		};

		requestAnimationFrame(update);

		return () => {
			if (animationFrameId != null) {
				cancelAnimationFrame(animationFrameId);
			}
		};
	}, []);

	const formatNumber = (number: number): string => (number < 10 ? `0${number}` : String(number));

	const hour = formatNumber(time.getHours());
	const minute = formatNumber(time.getMinutes());

	const timeString = `${hour}:${minute}`;

	// Definimos las variantes para la animación
	const underlineVariants = {
		initial: {
			x: '-100%',
		},
		hover: {
			x: 0,
		},
		exit: {
			x: '100%',
		},
	};

	useEffect(() => {
		const handleScroll = (): void => {
			if (window.scrollY > 200) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};

		window.addEventListener('scroll', handleScroll);
		// on load
		handleScroll();

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	useEffect(() => {
		if (isMenuActive) {
			document.body.style.overflowY = 'hidden';
		} else {
			document.body.style.overflowY = 'auto';
		}

		return () => {
			document.body.style.overflowY = 'auto';
		};
	}, [isMenuActive]);

	return (
		<>
			<div className="fixed w-full h-[90px] overflow-hidden z-50">
				<div className="mx-10 h-full">
					<div className="h-full w-full">
						<motion.div
							initial={{
								y: 0,
							}}
							animate={{
								y: isScrolled || isMenuActive ? -100 : 0,
							}}
							transition={{
								type: 'spring',
								stiffness: 100,
								damping: 15,
							}}
						>
							<div
								className="flex items-center h-[90px] justify-between text-xl text-white font-medium"
								style={{
									opacity: isScrolled || isMenuActive ? 0 : 1,
									transition: 'opacity 1s ease-out',
								}}
							>
								<a className="flex items-center" href="/">
									<img
										src="/svg/isotipo_blanco.svg"
										alt="Isotipo de la marca"
										className="h-10 mr-4"
									/>
								</a>
								<div className="flex items-center space-x-8">
									{buttons.map((button, index) => (
										<motion.div
											key={index}
											className="block overflow-hidden relative"
											onMouseEnter={() => {
												setHoverIndex(index);
											}}
											onMouseLeave={() => {
												setHoverIndex(null);
											}}
										>
											<a href={button.href}>{button.name}</a>
											<AnimatePresence>
												{hoverIndex === index && (
													<motion.div
														className="h-[1px] bg-white w-full absolute bottom-0 left-0"
														variants={underlineVariants}
														initial="initial"
														animate="hover"
														exit="exit"
														transition={{
															type: 'tween',
															duration: 0.4,
															ease: 'easeInOut',
														}}
														key={`underline-${index}`}
													/>
												)}
											</AnimatePresence>
										</motion.div>
									))}
								</div>
								{/* Reloj */}
								<div className="flex items-center overflow-hidden gap-2 justify-center mx-52">
									<FontAwesomeIcon icon={faClock} width={18} height={18} />
									<p>Quito, Ecuador</p>
									<div>
										{timeString.split('').map((char, index) => (
											<AnimatePresence key={`time-${index}`} mode="wait">
												<motion.div
													initial={{ y: 30 }}
													animate={{ y: 0 }}
													exit={{ y: -30 }}
													key={char + index} // Unique key to trigger animations
													style={{
														display: 'inline-block',
														textAlign: 'center',
													}}
													transition={{
														type: 'tween',
														duration: 0.7,
														ease: 'easeInOut',
													}}
												>
													{char}
												</motion.div>
											</AnimatePresence>
										))}
									</div>
								</div>
								<div>
									<motion.a
										href="#"
										className="p-4 bg-red text-white font-bold rounded-2xl hover:text-red hover:bg-white transition-colors"
										whileHover={{
											boxShadow: '5px 5px 0px #ea0020',
										}}
										transition={{
											boxShadow: {
												type: 'spring',
												damping: 10,
												mass: 0.75,
												stiffness: 300,
											},
										}}
									>
										Contacto
									</motion.a>
								</div>
							</div>
							<div
								className="flex items-center h-[90px] justify-between text-xl text-white font-medium"
								style={{
									opacity: isScrolled || isMenuActive ? 1 : 0,
									transition: 'opacity 1s ease-out',
								}}
							>
								<a href="/">
									<motion.img
										src="/svg/logo_text_rojo.svg"
										alt="Isotipo de la marca"
										className="h-7 mr-4"
									/>
								</a>
								<motion.div
									style={{
										scale: 0.6,
									}}
								>
									<div
										id="menu-btn"
										ref={menuButton}
										onClick={(e) => {
											e.preventDefault();
											if (menuButton.current != null) {
												if (menuButton.current.classList.contains('open')) {
													menuButton.current.classList.remove('open');
													menuButton.current.classList.add('close');
												} else {
													menuButton.current.classList.remove('close');
													menuButton.current.classList.add('open');
												}
											}
											setIsMenuActive(!isMenuActive);
										}}
										className="text-red cursor-pointer mt-4"
									>
										<span className="icon"></span>
										<span className="text">MENU</span>
									</div>
								</motion.div>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
			<AnimatePresence mode="wait">
				{isMenuActive && (
					<>
						{/* Capa 1 - Rojo */}
						<motion.div
							initial={{ y: '-100%' }}
							animate={{ y: 0 }}
							exit={{
								y: '-100%',
								transition: {
									delay: LAYER_DELAYS.firstLayer.close, // Aplica el retraso de cierre
									duration: 0.5,
									ease: 'easeOut',
								},
							}}
							transition={{
								delay: LAYER_DELAYS.firstLayer.open, // Aplica el retraso de apertura
								duration: 0.3,
								ease: 'easeOut',
							}}
							className="fixed bg-red w-full h-full z-40 top-0 left-0"
						/>

						{/* Capa 2 - Blanco */}
						<motion.div
							initial={{ y: '-100%' }}
							animate={{ y: 0 }}
							exit={{
								y: '-100%',
								transition: {
									delay: LAYER_DELAYS.secondLayer.close,
									duration: 0.7,
									ease: 'easeOut',
								},
							}}
							transition={{
								delay: LAYER_DELAYS.secondLayer.open,
								duration: 0.5,
								ease: 'easeOut',
							}}
							className="fixed bg-white w-full h-full z-[41] top-0 left-0"
						/>

						{/* Capa 3 - Menú */}
						<motion.div
							initial={{ y: '-100%' }}
							animate={{ y: 0 }}
							exit={{
								y: '-100%',
								transition: {
									delay: LAYER_DELAYS.thirdLayer.close,
									duration: 0.7,
									ease: 'easeOut',
								},
								opacity: 0,
							}}
							transition={{
								delay: LAYER_DELAYS.thirdLayer.open,
								duration: 0.7,
								ease: 'easeOut',
								delayChildren: 2,
							}}
							className="fixed bg-black w-full h-full z-[42] top-0 left-0"
						>
							<div className="flex w-full h-full items-center text-white">
								<div className="flex flex-col justify-between items-start h-full w-2/3">
									<div className="relative w-full h-full">
										<motion.div
											initial={{
												opacity: 0,
											}}
											animate={{
												opacity: 1,
											}}
											exit={{
												opacity: 0,
											}}
											transition={{
												type: 'tween',
												duration: 1,
												ease: 'easeInOut',
												delay: 1.2,
											}}
										>
											<AnimatePresence>
												{images.map(
													(image, index) =>
														imageSrc === image && (
															<motion.img
																key={index}
																src={image.src}
																alt="Profile"
																className="absolute w-full h-full object-cover"
																initial={{
																	opacity: 0,
																}}
																animate={{
																	opacity: 1,
																}}
																exit={{
																	opacity: 0,
																}}
																transition={{
																	type: 'tween',
																	duration: 1,
																	ease: 'easeInOut',
																}}
															/>
														),
												)}
											</AnimatePresence>
										</motion.div>
									</div>
								</div>
								<div className="h-full w-1/3 flex flex-col justify-around">
									<div className="flex flex-col justify-between">
										<ul>
											<li className="w-full relative py-12">
												<motion.h1
													className="text-8xl font-bold ml-12"
													initial={{
														opacity: 0,
														y: 100,
													}}
													animate={{
														opacity: 1,
														y: 0,
													}}
													exit={{
														opacity: 0,
														y: 100,
													}}
													transition={{
														type: 'tween',
														duration: 0.7,
														ease: 'easeInOut',
														delay: 0.2 + 1,
													}}
												>
													MENU
												</motion.h1>
												<motion.span
													className="w-full bg-white h-[1px] inline-block absolute bottom-0 left-0"
													initial={{
														width: 0,
													}}
													animate={{
														width: '100%',
													}}
													exit={{
														width: 0,
													}}
													transition={{
														type: 'tween',
														duration: 0.7,
														ease: 'easeInOut',
														delay: 0.2 + 1,
													}}
												/>
											</li>
											{buttons.map((button, index) => (
												<motion.li
													className="w-full cursor-pointer relative py-12"
													onMouseEnter={() => {
														setHoverIndex(index);
														setImageSrc(images[index]);
													}}
													onMouseLeave={() => {
														setHoverIndex(null);
													}}
												>
													<motion.span
														className="inline-block absolute bottom-0 left-0 bg-white -z-10"
														style={{
															height: hoverIndex === index ? '100%' : 1,
															transition: 'height 0.2s ease-out',
														}}
														initial={{
															width: 0,
														}}
														animate={{
															width: '100%',
														}}
														exit={{
															width: 0,
														}}
														transition={{
															type: 'tween',
															duration: 0.7,
															ease: 'easeInOut',
															delay: index * 0.2 + 1,
														}}
													/>
													<motion.a
														key={index}
														href={button.href}
														className="text-4xl ml-12"
														style={{
															fontFamily: 'Bruta Pro Extended, sans-serif',
															color: hoverIndex === index ? '#ea0020' : 'white',
															fontWeight: hoverIndex === index ? 900 : 400,
															transition: 'all 0.2s ease-out',
														}}
														initial={{
															opacity: 0,
														}}
														animate={{
															opacity: 1,
														}}
														exit={{
															opacity: 0,
														}}
														transition={{
															type: 'tween',
															duration: 0.7,
															ease: 'easeInOut',
															delay: index * 0.3 + 1.2,
														}}
													>
														{button.name}
													</motion.a>
												</motion.li>
											))}
											<li className="w-full flex items-center justify-center py-12">
												<motion.a
													href="#"
													className="text-4xl p-4 bg-red text-white font-bold rounded-2xl hover:text-red hover:bg-white transition-colors"
													whileHover={{
														boxShadow: '5px 5px 0px #ea0020',
													}}
													transition={{
														boxShadow: {
															type: 'spring',
															damping: 10,
															mass: 0.75,
															stiffness: 300,
														},
														type: 'tween',
														duration: 0.7,
														ease: 'easeInOut',
														delay: 1.5,
													}}
													initial={{
														opacity: 0,
														y: 100,
													}}
													animate={{
														opacity: 1,
														y: 0,
													}}
													exit={{
														opacity: 0,
														y: 100,
													}}
												>
													Contacto
												</motion.a>
											</li>
										</ul>
									</div>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
};

export default Navbar;
