import React, { useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

interface props {
	src: string;
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
	...props
}) => {
	const [isLoaded, setIsLoaded] = useState(false);

	return (
		<>
			{!isLoaded && (
				<SkeletonTheme baseColor="#27474f" highlightColor="#559b81">
					<Skeleton height={height} width={width} circle={circle} className={skeletonClassName} />
				</SkeletonTheme>
			)}
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
		</>
	);
};

export default ImageLoader;
