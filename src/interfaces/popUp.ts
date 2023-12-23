export type ResponseCode = 'success' | 'warning' | 'danger' | 'info';

export interface popUp {
	visible: boolean;
	type: ResponseCode;
	title: string;
	message: string;
}

export type InputType =
	| 'text'
	| 'password'
	| 'email'
	| 'number'
	| 'range'
	| 'date'
	| 'month'
	| 'week'
	| 'time'
	| 'datetime-local'
	| 'color'
	| 'checkbox'
	| 'radio'
	| 'file'
	| 'submit'
	| 'image'
	| 'reset'
	| 'button'
	| 'search'
	| 'url'
	| 'tel'
	| 'hidden';

export interface InputPopupProps {
	visible: boolean;
	content: string;
	placeholder?: string;
	type: InputType;
	message: string;
}
