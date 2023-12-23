import { atom } from 'nanostores';

import type { InputPopupProps, popUp } from '../interfaces/popUp';

export const popupStore = atom<popUp>({
	visible: false,
	type: 'danger',
	title: '',
	message: '',
});

export const inputPopupStore = atom<InputPopupProps>({
	visible: false,
	content: '',
	placeholder: '',
	type: 'text',
	message: '',
});
