import Tooltip from '@components/ciddt-admin/Tooltip';
import { faCheckCircle, faClipboard, faSpinner, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { type FC, memo, useState } from 'react';

interface CopyToClipboardProps {
	text: string;
}

const CopyToClipboard: FC<CopyToClipboardProps> = ({ text }) => {
	const [icon, setIcon] = useState<IconDefinition>(faClipboard);
	const [isCopied, setIsCopied] = useState(false);

	const copyToClipboard = async (): Promise<void> => {
		setIsCopied(true);
		setIcon(faSpinner);

		// Simular un retraso en el proceso de copiado
		await new Promise((resolve) => setTimeout(resolve, 500));

		await navigator.clipboard.writeText(text);
		setIcon(faCheckCircle);

		setTimeout(() => {
			setIcon(faClipboard);
			setIsCopied(false);
		}, 1000);
	};

	return (
		<Tooltip
			content={isCopied ? 'Copied!' : 'Copy to clipboard'}
			className={isCopied ? '!bg-green-500' : ''}
			show={!isCopied || icon === faCheckCircle}
		>
			<FontAwesomeIcon
				icon={icon}
				className={`h-3 w-3 mb-[1px] ${icon === faSpinner ? 'animate-spin' : 'cursor-pointer'} ${
					icon === faCheckCircle ? 'text-green-500' : ''
				}`}
				onClick={() => {
					if (icon === faCheckCircle || icon === faSpinner) return;
					void copyToClipboard();
				}}
			/>
		</Tooltip>
	);
};

export default memo(CopyToClipboard);
