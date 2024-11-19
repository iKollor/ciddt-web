import React, { memo, useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

interface Props {
	src: string | undefined;
	type: 'image' | 'video';
	alt?: string;
	style?: React.CSSProperties;
	circle?: boolean;
	className?: string;
	skeletonClassName?: string;
	height: number;
	width: number;
}

const ImageLoader: React.FC<Props> = ({
	src,
	alt,
	circle = false,
	className,
	skeletonClassName,
	height,
	width,
	type,
	...props
}) => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [isError, setIsError] = useState(false);

	const defaultImageSrc = '/assets/images/default_placeholder.png'; // Asegúrate de tener una imagen predeterminada válida

	const imageSrc = isError ? defaultImageSrc : src;

	const handleImageError = (): void => {
		setIsError(true);
		setIsLoaded(true); // Para quitar el esqueleto una vez que se detecte el error
	};

	return (
		<>
			{!isLoaded && (
				<SkeletonTheme baseColor="#27474f" highlightColor="#559b81">
					<Skeleton
						height={height}
						width={type === 'image' ? width : width * 0.7}
						circle={circle}
						className={skeletonClassName}
					/>
				</SkeletonTheme>
			)}
			{type === 'image' ? (
				<img
					src={imageSrc ?? defaultImageSrc}
					alt={alt}
					onLoad={() => {
						setIsLoaded(true);
					}}
					onError={handleImageError}
					style={{ display: isLoaded ? 'block' : 'none', ...props.style }}
					className={`${className} ${isLoaded ? '' : 'hidden'}`}
					height={height}
					width={width}
					{...props}
				/>
			) : (
				<video
					src={src}
					onLoadedData={() => {
						setIsLoaded(true);
					}}
					onError={handleImageError}
					style={{ display: isLoaded ? 'block' : 'none', ...props.style }}
					className={`${className} ${isLoaded ? '' : 'hidden'}`}
					height={height}
					width={width}
					autoPlay
					loop
					muted
					{...props}
				/>
			)}
		</>
	);
};

export default memo(ImageLoader);
