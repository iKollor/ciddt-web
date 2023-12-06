import { atom } from 'nanostores';

import type { popUp } from '../interfaces/popUp';

export const popupStore = atom<popUp>({
	visible: false,
	type: 'danger',
	title: '',
	message: '',
});

export const InputPopup = atom({
	visible: false,
	content: '',
});
