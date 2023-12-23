import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'framer-motion';
import { loader } from 'frontend/src/hooks/pushBody';
import { useEffect, useState } from 'react';

const Loader: React.FC = (): React.ReactElement => {
	const $loader = useStore(loader);
	const [animatedProgress, setAnimatedProgress] = useState(0);

	useEffect(() => {
		if ($loader.progress != null) {
			const timer = setTimeout(() => {
				setAnimatedProgress((prev) => (prev < ($loader.progress ?? 0) ? prev + 1 : prev));
			}, 50); // Ajusta este tiempo para controlar la velocidad de la animación

			return () => {
				clearTimeout(timer);
			};
		}
	}, [animatedProgress, $loader.progress]);

	const variants = {
		initial: {
			opacity: 0,
		},
		animate: {
			opacity: 1,
		},
		exit: {
			opacity: 0,
		},
	};

	return (
		<AnimatePresence>
			{$loader.isLoading && (
				<motion.div
					variants={variants}
					initial="initial"
					animate="animate"
					exit="exit"
					transition={{ duration: 0.3 }}
					className="fixed top-0 left-0 w-full h-full bg-edgewater-950 bg-opacity-50 z-50 transition-opacity duration-300 ease-in-out  backdrop-blur-sm backdrop-brightness-[60%]"
				>
					<div className="flex items-center justify-center w-full h-full flex-col gap-5">
						{$loader.type === 'infinite' ? (
							<FontAwesomeIcon icon={faSpinner} className="h-32 w-32 animate-spin" />
						) : (
							$loader.progress != null && (
								<div className="flex w-full items-center justify-center">
									<motion.span
										className="h-2 mr-5 bg-white rounded-md"
										animate={{
											width: $loader.progress,
											transition: { duration: 0.5 },
										}}
									/>
									<span className="text-center">{animatedProgress}%</span>
								</div>
							)
						)}
						<h1 className="text-2xl text-center font-bold mt-5">{$loader.message}</h1>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default Loader;
