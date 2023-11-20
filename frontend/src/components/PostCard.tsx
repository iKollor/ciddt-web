/* eslint-disable @typescript-eslint/explicit-function-return-type */
import type { Post } from '../interfaces/Post';

interface PostCardProps {
	post?: Post;
	index?: number;
}

const PostCard = ({ post, index }: PostCardProps) => {
	return (
		<>
			<div className="Post w-[300px] h-[450px] aspect-video bg-black rounded-3xl"></div>
		</>
	);
};

export default PostCard;
