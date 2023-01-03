export function proc_exit(code: number) {
	throw {
		name: 'ExitStatus',
		message: `Program terminated with exit(${code}).`,
		status: code
	};
}
