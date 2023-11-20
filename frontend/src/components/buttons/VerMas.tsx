/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { motion } from 'framer-motion';

function VerMas() {
	return (
		<>
			<motion.a
				href="#"
				style={{
					padding: '15px 17px',
					backgroundColor: '#db001c',
					fontSize: '1.5rem',
					marginRight: '100px',
					borderRadius: '15px',
					fontWeight: 'bold',
				}}
				whileHover={{ x: -5, y: -5, boxShadow: '5px 5px 0px #1d1d1b' }}
				transition={{
					type: 'spring',
					damping: 10,
					mass: 0.75,
					stiffness: 300,
				}}
			>
				VER MÁS
			</motion.a>
		</>
	);
}

export default VerMas;
