import React, { useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

interface props {
	src: string;
	type: 'image' | 'video';
	alt?: string;
	style?: React.CSSProperties;
	circle?: boolean;
	className?: string;
	skeletonClassName?: string;
	height: number;
	width: number;
}

const ImageLoader: React.FC<props> = ({
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

	return (
		<>
			{!isLoaded && (
				<SkeletonTheme baseColor="#27474f" highlightColor="#559b81">
					<Skeleton
						height={height}
						width={type === 'image' ? width : width * 0.8}
						circle={circle}
						className={skeletonClassName}
					/>
				</SkeletonTheme>
			)}
			{type === 'image' ? (
				<img
					src={src}
					alt={alt}
					onLoad={() => {
						setIsLoaded(true);
					}}
					style={{ display: isLoaded ? 'block' : 'none', ...props.style }}
					{...props}
					className={`${className} ${isLoaded ? '' : 'hidden'}`}
					height={height}
					width={width}
				/>
			) : (
				<video
					src={src}
					onLoadedData={() => {
						setIsLoaded(true);
					}}
					style={{ display: isLoaded ? 'block' : 'none', ...props.style }}
					{...props}
					className={`${className} ${isLoaded ? '' : 'hidden'}`}
					height={height}
					width={width}
					autoPlay
					loop
					muted
				/>
			)}
		</>
	);
};

export default ImageLoader;
