import { atom } from 'nanostores';

import type { UserPage } from '../interfaces/UserPages';

export const pageStore = atom<UserPage>({
	accessToken: '',
	id: '',
	name: '',
});

export const pageListStore = atom<UserPage[]>([]);
