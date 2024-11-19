/* eslint-disable @typescript-eslint/explicit-function-return-type */
// eslint-disable-next-line import/no-unresolved
import { navigate } from 'astro:transitions/client';
import FeatherIcon from 'feather-icons-react';
import { motion } from 'framer-motion';
import { memo, useEffect, useRef, useState } from 'react';

interface NavLink {
	name: string;
	icon: string;
	href: string;
}

interface NavbarProps {
	navLinks: NavLink[];
}

const Navbar: React.FC<NavbarProps> = ({ navLinks }) => {
	const navbarRef = useRef<HTMLDivElement>(null);
	const [constraints, setConstraints] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
	const [activeLink, setActiveLink] = useState(() => {
		// return actual url path
		const path = window.location.pathname;
		// buscar path en navLinks
		const link = navLinks.find((l) => l.href === path);
		return link?.href ?? navLinks[0].href;
	});
	const [nextActiveLink, setNextActiveLink] = useState(activeLink);
	const [tooltipPosition, setTooltipPosition] = useState<'right' | 'left'>('right');
	const [tooltipContent, setTooltipContent] = useState('');
	const [showTooltip, setShowTooltip] = useState(false);

	useEffect(() => {
		const updateTooltipPosition = () => {
			if (navbarRef.current != null) {
				const navbarRect = navbarRef.current.getBoundingClientRect();
				const middleOfScreen = window.innerWidth / 2;
				setTooltipPosition(navbarRect.left < middleOfScreen ? 'right' : 'left');
			}
		};
		const updateConstraints = () => {
			if (navbarRef.current != null) {
				const navbarRect = navbarRef.current.getBoundingClientRect();
				setConstraints({
					top: 0,
					right: window.innerWidth - navbarRect.width,
					bottom: window.innerHeight - navbarRect.height,
					left: 0,
				});
				updateTooltipPosition();
			}
		};

		window.addEventListener('resize', updateConstraints);

		// Observar los cambios después del arrastre
		if (navbarRef.current != null) {
			const observer = new MutationObserver(updateTooltipPosition);
			observer.observe(navbarRef.current as Node, { attributes: true });
			updateConstraints();
			return () => {
				window.removeEventListener('resize', updateConstraints);
				observer.disconnect();
			};
		}
	}, []);

	const navInitialPosition = { x: 0, y: 0 };

	const getNavLinksPosition = (linkHref: string) => {
		const index = navLinks.findIndex((l) => l.href === linkHref);
		return `${index * 100}%`;
	};

	const handleClick = async (linkHref: string) => {
		setNextActiveLink(linkHref);
		// redirect to href
		await navigate(linkHref, {});
	};

	return (
		<motion.nav
			ref={navbarRef}
			drag
			dragConstraints={constraints}
			dragElastic={0.5}
			dragTransition={{ timeConstant: 200, power: 0.2 }}
			initial={navInitialPosition}
			style={{
				zIndex: 48,
				position: 'fixed',
				top: '10px',
				left: '10px',
				boxShadow:
					'0px 1px 1px 0px rgba(0,0,0,0.08), 0px 2px 2px 0px rgba(0,0,0,0.12), 0px 4px 4px 0px rgba(0,0,0,0.16), 0px 8px 8px 0px rgba(0,0,0,0.2)',
				borderRadius: '8px',
				padding: '10px',
			}}
			className="bg-edgewater-950 text-white flex flex-col w-24 text-center backdrop-blur-md bg-opacity-50"
		>
			<div className="cursor-grab h-8 flex justify-center">
				<FeatherIcon icon="more-horizontal" className="opacity-30" />
			</div>
			<ul
				className={`list-none grid grid-rows-${navLinks.length} relative`}
				style={{ height: `${navLinks.length * 66.6666666667}px` }}
			>
				{navLinks.map((link, idx) => (
					<li
						key={idx}
						className="flex items-center justify-center rounded-md transition-all cursor-pointer z-[1]"
					>
						<a
							key={link.name}
							onMouseEnter={() => {
								setActiveLink(link.href);
								setTooltipContent(link.href);
								setShowTooltip(true);
							}}
							onMouseLeave={() => {
								setActiveLink(nextActiveLink);
								setShowTooltip(false);
							}}
							onClick={() => {
								void handleClick(link.href);
							}}
							className="flex items-center justify-center h-full w-full"
						>
							<FeatherIcon icon={link.icon} />
							{showTooltip && tooltipContent === link.href && (
								<Tooltip content={link.name} tooltipPosition={tooltipPosition} />
							)}
						</a>
					</li>
				))}
				<motion.div
					className="absolute h-[66.6666666667px] w-full top-0 z-0 bg-edgewater-900 rounded-md"
					initial={{ y: 0 }}
					animate={{ y: getNavLinksPosition(activeLink) }}
					transition={{ type: 'tween', duration: 0.3 }}
				></motion.div>
			</ul>
		</motion.nav>
	);
};

export default memo(Navbar);

interface TooltipProps {
	content: string;
	tooltipPosition: 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, tooltipPosition }) => {
	return (
		<motion.span
			className={`absolute p-2 bg-gray-700 text-white rounded-md shadow-lg ${
				tooltipPosition === 'right' ? 'left-full ml-2' : 'right-full mr-2'
			}`}
			initial={{ opacity: 0, scale: 0.6 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.6 }}
			transition={{ type: 'spring', stiffness: 260, damping: 20 }}
		>
			{content}
		</motion.span>
	);
};
