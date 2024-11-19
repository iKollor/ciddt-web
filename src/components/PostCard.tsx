import {
	faFacebookSquare,
	faInstagram,
	faTwitter,
	faTwitterSquare,
	type IconDefinition,
} from '@fortawesome/free-brands-svg-icons';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import type { Post } from 'src/interfaces/Post';

interface PostcardProps {
	post: Post;
	isFocused: boolean;
}

const Postcard: React.FC<PostcardProps> = ({ post, isFocused }) => {
	const [isHover, setIsHover] = useState(false);
	const { text, links } = separarLinks(post.details);

	return (
		<div
			className={`w-full h-full relative overflow-hidden saturate-0 hover:saturate-100 ${
				isFocused && 'saturate-100'
			} transition-all duration-300 ease-in-out cursor-pointer`}
			onClick={() => {
				if (!isFocused) window.open(post.url, '_blank');
			}}
			onMouseEnter={() => {
				setIsHover(true);
			}}
			onMouseLeave={() => {
				setIsHover(false);
			}}
		>
			{post.mediaType === 'video' ? (
				<video
					src={post.media}
					className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 "
					muted
					loop
					autoPlay
				/>
			) : (
				<img
					src={post.media}
					alt="Post media"
					className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2"
				/>
			)}

			<AnimatePresence>
				{isHover && (
					<motion.div
						className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent h-1/2 flex flex-col justify-end items-start p-4"
						initial={{
							opacity: 0,
							y: 20,
						}}
						animate={{
							opacity: 1,
							y: 0,
						}}
						exit={{
							opacity: 0,
							y: 20,
						}}
						transition={{
							type: 'tween',
							duration: 0.3,
							ease: 'easeInOut',
						}}
					>
						<div className="w-full">
							<p className="line-clamp-3">{text}</p>
						</div>
						{links.length > 0 && (
							<div className="w-full">
								<h1 className="font-bold">Enlaces Adjuntos</h1>
								{links.map((link, index) => (
									<a
										key={index}
										href={link}
										target="_blank"
										rel="noreferrer"
										className="line-clamp-1 hover:text-red"
									>
										{link}
									</a>
								))}
							</div>
						)}
						<div className="w-full mt-2 items-center flex justify-between">
							<div>
								<FontAwesomeIcon icon={faHeart} className="mr-2" />
								{post.likesCount}
							</div>
							<FontAwesomeIcon
								icon={getProviderIcon(post.provider)}
								size="2x"
								className="text-white"
								title="Abrir publicación en la red social"
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

// Función para separar texto de links y retornar ambos valores
function separarLinks(texto: string): { text: string; links: string[] } {
	const regex = /https?:\/\/[^\s]+/g;
	const links = (texto.match(regex) ?? '') as string[];
	const text = texto.replace(regex, '');
	return { text, links };
}

function getProviderIcon(provider: string): IconDefinition {
	switch (provider) {
		case 'twitter':
			return faTwitterSquare;
		case 'instagram':
			return faInstagram;
		case 'facebook':
			return faFacebookSquare;
		case 'tiktok':
			return faTwitter;
		default:
			throw new Error('No se encontró el ícono para el proveedor');
	}
}

export default Postcard;
