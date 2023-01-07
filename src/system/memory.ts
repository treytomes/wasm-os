import settings from '../settings';
import * as process from './process';

// Memory sizes are in 64Kb pages.
export let memory = new WebAssembly.Memory({
	initial: settings.INITIAL_SIZE_PAGES,
	maximum: settings.MAXIMUM_SIZE_PAGES
});

export let HEAP8: Int8Array;
export let HEAP16: Int16Array;
export let HEAP32: Int32Array;
export let HEAPU8: Uint8Array;
export let HEAPU16: Uint16Array;
export let HEAPU32: Uint32Array;
export let HEAPF32: Float32Array;
export let HEAPF64: Float64Array;

export const sizeofInt8 = 1;
export const sizeofInt16 = 2;
export const sizeofInt32 = 4;
export const sizeofUint8 = 1;
export const sizeofUint16 = 2;
export const sizeofUint32 = 4;
export const sizeofFloat32 = 4;
export const sizeofFloat64 = 8;

export class MemoryMap {
	static instance: MemoryMap;

	lastKeyPress: number;
	videoMemory: number;
	textMemory: number;
	fontMemory: number;

	constructor(lastKeyPress: number, videoMemory: number, textMemory: number, fontMemory: number) {
		this.lastKeyPress = lastKeyPress;
		this.videoMemory = videoMemory;
		this.textMemory = textMemory;
		this.fontMemory = fontMemory;
	}
}

function updateGlobalBufferAndViews() {
	HEAP8 = new Int8Array(memory.buffer);
	HEAP16 = new Int16Array(memory.buffer);
	HEAP32 = new Int32Array(memory.buffer);
	HEAPU8 = new Uint8Array(memory.buffer);
	HEAPU16 = new Uint16Array(memory.buffer);
	HEAPU32 = new Uint32Array(memory.buffer);
	HEAPF32 = new Float32Array(memory.buffer);
	HEAPF64 = new Float64Array(memory.buffer);
}

export function setMemory(mem: WebAssembly.Memory) {
	memory = mem;
	updateGlobalBufferAndViews();
}

function abortOnCannotGrowMemory(requestedSize: number) {
	process.abort(`Cannot enlarge memory arrays to size ${requestedSize} bytes (OOM). Either (1) compile with -sINITIAL_MEMORY=X with X higher than the current value ${HEAP8.length}, (2) compile with -sALLOW_MEMORY_GROWTH which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with -sABORTING_MALLOC=0`);
}

export function emscripten_resize_heap(requestedSize: number) {
	//var oldSize = HEAPU8.length;
	requestedSize = requestedSize >>> 0;
	abortOnCannotGrowMemory(requestedSize);
}