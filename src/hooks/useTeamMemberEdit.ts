import { atom } from 'nanostores';
import type { FilePreview } from 'src/interfaces/popUp';

import type { pseudoUser } from './useEditProfileManagement';
// Asegúrate de que la ruta sea correcta

export const useTeamMemberEdit = atom<pseudoUser | null>(null);

export const previewImage = atom<FilePreview | null>(null);
