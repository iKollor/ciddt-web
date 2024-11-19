/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable import/no-named-as-default */

import { faImage } from '@fortawesome/free-regular-svg-icons';
import {
	faAlignCenter,
	faAlignJustify,
	faAlignLeft,
	faAlignRight,
	faBold,
	faItalic,
	faList12,
	faListDots,
	faParagraph,
	faQuoteLeft,
	faRedo,
	faRuler,
	faUndo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type Editor, EditorContent } from '@tiptap/react';
import type { UserRecord } from 'firebase-admin/auth';
import type { FC } from 'react';

import FileUploader from './FileUploader';

const MenuBar: FC<{ editor: Editor; userRecord?: UserRecord }> = ({ editor, userRecord }) => {
	if (editor == null) {
		return null;
	}

	function insertImage(url: string): void {
		editor.chain().focus().setImage({ src: url }).run();
	}

	return (
		<div className="space-y-4">
			<div className="w-full flex gap-x-4">
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 font-bold ${editor.isActive('bold') ? 'bg-edgewater-800' : 'bg-edgewater-600'}`}
					onClick={() => editor.chain().focus().toggleBold().run()}
				>
					<FontAwesomeIcon icon={faBold} />
				</button>
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 italic ${editor.isActive('italic') ? 'bg-edgewater-800' : 'bg-edgewater-600'}`}
					onClick={() => editor.chain().focus().toggleItalic().run()}
				>
					<FontAwesomeIcon icon={faItalic} />
				</button>
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 ${editor.isActive('blockquote') ? 'bg-edgewater-800' : 'bg-edgewater-600'}`}
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
				>
					<FontAwesomeIcon icon={faQuoteLeft} />
				</button>
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 ${editor.isActive('bulletList') ? 'bg-edgewater-800' : 'bg-edgewater-600'}`}
					onClick={() => editor.chain().focus().toggleBulletList().run()}
				>
					<FontAwesomeIcon icon={faListDots} />
				</button>
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 ${editor.isActive('orderedList') ? 'bg-edgewater-800' : 'bg-edgewater-600'}`}
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
				>
					<FontAwesomeIcon icon={faList12} />
				</button>
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 bg-edgewater-600`}
					onClick={() => editor.chain().focus().setHorizontalRule().run()}
				>
					<FontAwesomeIcon icon={faRuler} />
				</button>
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 bg-edgewater-600`}
					onClick={() => editor.chain().focus().undo().run()}
				>
					<FontAwesomeIcon icon={faUndo} />
				</button>
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 bg-edgewater-600`}
					onClick={() => editor.chain().focus().redo().run()}
				>
					<FontAwesomeIcon icon={faRedo} />
				</button>
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 ${editor.isActive('left') ? 'bg-edgewater-800' : 'bg-edgewater-600'}`}
					onClick={() => editor.chain().focus().setTextAlign('left').run()}
				>
					<FontAwesomeIcon icon={faAlignLeft} />
				</button>
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 ${editor.isActive('center') ? 'bg-edgewater-800' : 'bg-edgewater-600'}`}
					onClick={() => editor.chain().focus().setTextAlign('center').run()}
				>
					<FontAwesomeIcon icon={faAlignCenter} />
				</button>
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 ${editor.isActive('right') ? 'bg-edgewater-800' : 'bg-edgewater-600'}`}
					onClick={() => editor.chain().focus().setTextAlign('right').run()}
				>
					<FontAwesomeIcon icon={faAlignRight} />
				</button>
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 ${editor.isActive('justify') ? 'bg-edgewater-800' : 'bg-edgewater-600'}`}
					onClick={() => editor.chain().focus().setTextAlign('justify').run()}
				>
					<FontAwesomeIcon icon={faAlignJustify} />
				</button>
				<FileUploader
					type="picker"
					userRecord={userRecord}
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 ${editor.isActive('justify') ? 'bg-edgewater-800' : 'bg-edgewater-600'}`}
					buttonText=""
					buttonIcon={faImage}
					onFileSelected={(file) => {
						insertImage(file.url);
					}}
				/>
			</div>
			{/** headings */}
			<div className="w-full flex gap-x-4">
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 ${editor.isActive('heading', { level: 1 }) ? 'bg-edgewater-800' : 'bg-edgewater-600'}`}
					onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
				>
					H1
				</button>
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 ${editor.isActive('heading', { level: 2 }) ? 'bg-edgewater-800' : 'bg-edgewater-600'}`}
					onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
				>
					H2
				</button>
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 ${editor.isActive('heading', { level: 3 }) ? 'bg-edgewater-800' : 'bg-edgewater-600'}`}
					onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()}
				>
					H3
				</button>
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 ${editor.isActive('heading', { level: 4 }) ? 'bg-edgewater-800' : 'bg-edgewater-600'}`}
					onClick={() => editor.chain().focus().setHeading({ level: 4 }).run()}
				>
					H4
				</button>
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 ${editor.isActive('heading', { level: 5 }) ? 'bg-edgewater-800' : 'bg-edgewater-600'}`}
					onClick={() => editor.chain().focus().setHeading({ level: 5 }).run()}
				>
					H5
				</button>
				<button
					className={`hover:bg-edgewater-800 rounded-lg w-8 h-8 p-1 ${editor.isActive('paragraph') ? 'bg-edgewater-800' : 'bg-edgewater-600'}`}
					onClick={() => editor.chain().focus().setParagraph().run()}
				>
					<FontAwesomeIcon icon={faParagraph} />
				</button>
			</div>
		</div>
	);
};

export default ({
	editor,
	userRecord,
	isFocused,
}: {
	editor: Editor | null;
	userRecord?: UserRecord;
	isFocused: boolean;
}): any => {
	if (editor == null) {
		return <p>Loading...</p>;
	}

	return (
		<div
			className={`w-full solid ${!isFocused ? `border-edgewater-800` : ` border-edgewater-500`} border-[1px] rounded-xl p-4`}
		>
			<div className="mt-5 tiptap">
				<MenuBar editor={editor} userRecord={userRecord} />
				<EditorContent editor={editor} />
			</div>
		</div>
	);
};
