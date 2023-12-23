export type ResponseCode = 'success' | 'warning' | 'danger' | 'info';

export interface popUp {
	visible: boolean;
	type: ResponseCode;
	title: string;
	message: string;
}

export type InputType =
	| 'email'
	| 'password'
	| 'text'
	| 'number'
	| 'tel'
	| 'url'
	| 'search'
	| 'date'
	| 'time'
	| 'datetime-local'
	| 'month'
	| 'week'
	| 'color';

export interface InputPopupProps {
	visible: boolean;
	content: string;
	placeholder?: string;
	type: InputType;
	message: string;
}
