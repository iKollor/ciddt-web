import { motion } from 'framer-motion';
import type { Post } from 'frontend/src/interfaces/Post';
import { useRef, useState } from 'react';

interface Props {
	posts?: Post[] | null;
}

const PostsTable: React.FC<Props> = ({ posts }) => {
	const [verMas, setVerMas] = useState(true);

	// set ref to table
	const tableRef = useRef<HTMLDivElement>(null);

	return (
		<motion.div
			ref={tableRef}
			initial={{
				maxHeight: 460,
			}}
			animate={{
				maxHeight: verMas ? 460 : 850,
			}}
			className="flex flex-auto flex-col items-center mt-8 justify-start"
		>
			<div className="overflow-x-auto w-full overflow-y-hidden">
				<table className="w-full my-0 align-middle border-neutral-200">
					<thead className="align-bottom">
						<tr className="font-semibold text-sm text-white text-opacity-50">
							<th className="pb-2 pl-3 text-start min-w-[60px] uppercase">Post</th>
							<th className="pb-2 text-start min-w-[80px] uppercase">Página</th>
							<th className="pb-2 pl-6 text-start w-[130px] uppercase">Proveedor</th>
							<th className="pb-2 text-start min-w-[50px] uppercase">Tipo</th>
							<th className="pb-2 text-center min-w-[50px] uppercase">Likes</th>
							<th className="pb-2 text-start min-w-[120px] uppercase">Descripción</th>
							<th className="pb-2 pl-6 text-start min-w-[80px] uppercase">Creado en</th>
						</tr>
					</thead>
					<tbody>
						{posts?.map((post: Post, idx: number) => (
							<tr
								key={idx}
								className="border-b border-solid last:border-b-0 border-white border-opacity-20 hover:bg-edgewater-700 cursor-pointer transition-all duration-150 ease-in-out"
								onClick={() => window.open(post.url, '_blank')}
							>
								<td className="p-3 rounded-md max-w-[60px]">
									<div className="flex items-center">
										<div className="relative inline-block shrink-0">
											{post.mediaType === 'album' || post.mediaType === 'photo' ? (
												<img
													src={post.media}
													width={50}
													height={50}
													className="w-[50px] h-[50px] inline-block shrink-0 rounded-md"
													alt="post image preview"
												/>
											) : (
												<video
													src={post.media}
													width={50}
													height={50}
													className="w-[50px] h-[50px] inline-block shrink-0 rounded-md"
													autoPlay
													muted
													loop
												></video>
											)}
										</div>
									</div>
								</td>
								<td id="page" className="max-w-[120px] truncate" title={post.page}>
									{post.page}
								</td>
								<td id="provider" className="capitalize pl-6">
									{post.provider}
								</td>
								<td id="mediaType" className="capitalize w-[50px]">
									{post.mediaType}
								</td>
								<td id="likes" className="text-center">
									{post.likesCount}
								</td>
								<td id="details" className="max-w-[120px] truncate" title={post.details}>
									{post.details}
								</td>
								<td id="date" className="rounded-md pl-6">
									{new Date(post.timestamp).toLocaleDateString('es', {
										day: '2-digit',
										month: '2-digit',
										year: 'numeric',
									})}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{posts == null ? (
				<div className="flex flex-col items-center justify-center w-full h-full mt-4">
					<h1 className="text-xl text-white text-opacity-50">No hay posts</h1>
				</div>
			) : posts.length > 5 ? (
				<button
					className="capitalize py-2 px-4 bg-edgewater-700 hover:bg-edgewater-600 transition-all duration-150 ease-in-out rounded-md mt-4"
					onClick={() => {
						setVerMas(!verMas);
					}}
				>
					{verMas ? 'Ver más' : 'Ver menos'}
				</button>
			) : null}
		</motion.div>
	);
};

export default PostsTable;
