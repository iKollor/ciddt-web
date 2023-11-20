import { atom } from 'nanostores';

export const popupStore = atom({
	visible: false,
	type: '',
	title: '',
	message: '',
});

export const InputPopup = atom({
	visible: false,
	content: '',
});
