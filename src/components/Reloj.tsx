import { faClock } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import React, { type FC, useEffect, useState } from 'react';

const Reloj: FC = () => {
	const [time, setTime] = useState<Date | null>(null);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout;

		const fetchTime = async (): Promise<void> => {
			try {
				const response = await fetch('http://worldtimeapi.org/api/timezone/America/Guayaquil', {
					method: 'GET',
				});
				const data = await response.json();
				const dataDateTime: string = data.datetime;
				const quitoTime = new Date(dataDateTime);
				if (isNaN(quitoTime.getTime())) {
					throw new Error('Invalid date time from Quito');
				}
				setTime(quitoTime);
			} catch (error) {
				console.error('Error al obtener la fecha y hora de Quito:', error);
			}
		};

		const updateLocalTime = (): void => {
			setTime((prevTime) => {
				if (prevTime != null) {
					const newTime = new Date(prevTime.getTime() + 60000);
					return newTime;
				}
				return prevTime;
			});
		};

		const startTimer = (): void => {
			const now = new Date();
			const delay = (60 - now.getSeconds()) * 1000; // Milisegundos hasta el próximo minuto

			timeoutId = setTimeout(() => {
				updateLocalTime();
				setInterval(updateLocalTime, 60000); // Actualizar cada minuto
			}, delay);
		};

		void fetchTime().then(startTimer);

		return () => {
			clearTimeout(timeoutId);
		};
	}, []);

	const formatNumber = (number: number): string => (number < 10 ? `0${number}` : String(number));

	const hour = formatNumber(time?.getHours() ?? 0);
	const minute = formatNumber(time?.getMinutes() ?? 0);

	const timeString = `${hour}:${minute}`;

	return (
		<>
			{/* Reloj */}
			<div className="flex items-center overflow-hidden gap-2 justify-center mx-52">
				<FontAwesomeIcon icon={faClock} width={18} height={18} />
				<p>Quito, Ecuador</p>
				<div>
					{time != null &&
						timeString.split('').map((char, index) => (
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
		</>
	);
};

export default Reloj;
