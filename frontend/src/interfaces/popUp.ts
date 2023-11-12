export type ResponseCode = 'success' | 'warning' | 'danger' | 'info';

export interface popUp {
	type: ResponseCode;
	title: string;
	message: string;
}
