export interface UserPage {
	id: string;
	name: string;
	accessToken?: string | null;
	picture: string;
	account_type: 'facebook' | 'instagram';
	link?: string;
}
