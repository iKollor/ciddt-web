import { atom } from 'nanostores';

import type { pseudoUser } from './useEditProfileManagement';

export const chunkIndex = atom(0);
export const animationFinished = atom(false);
export const selectedCard = atom<pseudoUser>({
	displayName: '',
	position: '',
	age: 0,
	uid: '',
	details: '',
	urlFotoPerfil: '',
});
