export type ResponseCode = 'success' | 'warning' | 'danger' | 'info';

export interface popUp {
	visible: boolean;
	type: ResponseCode;
	title: string;
	message: string;
}
