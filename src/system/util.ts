export function pointerToString(memory: WebAssembly.Memory, pointer: number): string {
	let text = '';
	const buffer = new Uint8Array(memory.buffer);
	while (buffer[pointer] !== 0) {
		text += String.fromCharCode(buffer[pointer]);
		pointer++;
	}
	return text;
}
