import { motion } from 'framer-motion';
import React, { type MouseEvent, useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
	content: string;
	children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content }) => {
	const [visible, setVisible] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });

	const showTooltip = (e: MouseEvent): void => {
		setPosition({ x: e.pageX, y: e.pageY });
		setVisible(true);
	};

	const moveTooltip = (e: MouseEvent): void => {
		setPosition({ x: e.pageX, y: e.pageY });
	};

	const hideTooltip = (): void => {
		setVisible(false);
	};

	return (
		<div onMouseEnter={showTooltip} onMouseMove={moveTooltip} onMouseLeave={hideTooltip} className="relative">
			{children}
			{visible &&
				createPortal(
					<motion.div
						className="absolute bg-black text-white p-2 rounded shadow-lg max-w-md overflow-hidden text-ellipsis z-[49]"
						initial={{ opacity: 0, scale: 0 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0 }}
						style={{ top: position.y + 10, left: position.x + 10, transformOrigin: 'left' }}
						transition={{ type: 'spring', stiffness: 260, damping: 20 }}
					>
						{content}
					</motion.div>,
					document.body,
				)}
		</div>
	);
};

export default Tooltip;
