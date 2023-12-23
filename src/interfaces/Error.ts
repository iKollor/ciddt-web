export class FetchError extends Error {
	status: number;
	statusText: string;

	constructor(status: number, statusText: string, message: string) {
		super(message);

		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, FetchError);
		}

		this.status = status;
		this.statusText = statusText;
	}
}
