export let ABORT: boolean = false;
export let EXITSTATUS: number = 0;

export function proc_exit(code: number) {
	throw {
		name: 'ExitStatus',
		message: `Program terminated with exit(${code}).`,
		status: code
	};
}

export function abort(what: string) {
	/*
	if (Module['onAbort']) {
		Module['onAbort'](what);
	}
	*/

	what = `Aborted(${what})`;
	console.error(what);

	ABORT = true;
	EXITSTATUS = 1;

	// Use a wasm runtime error, because a JS error might be seen as a foreign
	// exception, which means we'd run destructors on it. We need the error to
	// simply make the program stop.
	// FIXME This approach does not work in Wasm EH because it currently does not assume
	// all RuntimeErrors are from traps; it decides whether a RuntimeError is from
	// a trap or not based on a hidden field within the object. So at the moment
	// we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
	// allows this in the wasm spec.

	// Suppress closure compiler warning here. Closure compiler's builtin extern
	// defintion for WebAssembly.RuntimeError claims it takes no arguments even
	// though it can.
	// TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
	/** @suppress {checkTypes} */
	var e = new WebAssembly.RuntimeError(what);

	// Throw the error whether or not MODULARIZE is set because abort is used
	// in code paths apart from instantiation where an exception is expected
	// to be thrown when abort is called.
	throw e;
}
