import { atom } from 'nanostores';

export const isMenuOpen = atom(false);
export const isMenuClosed = atom(true);

export interface LoaderType {
	isLoading: boolean;
	message?: string;
	type: 'progress' | 'infinite';
	progress?: number | null;
}

export const loader = atom<LoaderType>({
	isLoading: false,
	message: '',
	type: 'infinite',
	progress: null,
});
