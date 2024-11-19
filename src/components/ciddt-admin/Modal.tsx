import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useCallback } from 'react';

interface ModalProps {
	title: string;
	children: React.ReactNode;
	onClose: () => void;
	isOpen: boolean;
	width?: number;
}

const Modal: React.FC<ModalProps> = (props: ModalProps) => {
	const variants = {
		open: {
			opacity: 1,
			scale: 1,
			transition: { type: 'spring', damping: 15, stiffness: 300, restDelta: 0.001 },
		},
		closed: {
			opacity: 0,
			scale: 0,
			transition: { duration: 0.3, ease: 'easeInOut' },
		},
	};

	const handleClose = useCallback(
		(e: React.MouseEvent): void => {
			if (e.target !== e.currentTarget) return;
			props.onClose();
		},
		[props.onClose],
	);

	return (
		<AnimatePresence>
			{props.isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3, ease: 'easeInOut' }}
					className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-[49]"
					onClick={handleClose}
				>
					<motion.div
						variants={variants}
						initial="closed"
						animate="open"
						exit="closed"
						transition={{ duration: 0.3, ease: 'easeInOut' }}
						className={`bg-edgewater-800 p-10 rounded-xl shadow-xl w-[${props.width ?? 600}px]`}
					>
						<div className="flex justify-between items-start mb-6">
							<h1 className="text-4xl font-bold text-edgewater-300">{props.title}</h1>
							<FontAwesomeIcon
								icon={faClose}
								className="text-edgewater-300 hover:text-edgewater-500 hover:rotate-90 hover:scale-125 transition-all duration-300 cursor-pointer ease-in-out w-6 h-6"
								onClick={props.onClose}
							/>
						</div>
						{props.children}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default memo(Modal);
