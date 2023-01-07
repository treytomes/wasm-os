import * as serial from './system/serial';
import * as process from './system/process';
import settings from './settings';
import * as memory from './system/memory';
import * as graphics from './graphics/init';
import { DisplayMode } from './graphics/DisplayMode';
import { Color } from './graphics/Color';

interface IKernelExports {
	memory: WebAssembly.Memory;

	main: () => void;
	irq_handler: (irq: number) => void;
	get_memory_map: () => number;
}

let exports;

const wasi_imports = {
	'proc_exit': process.proc_exit
};

function loadMemoryMap(memoryMapPointer: number) {
	console.log('Loading memory map.');
	const memoryMapU32Pointer = memoryMapPointer / memory.sizeofUint32;
	
	const lastKeyPress = memory.HEAPU32[memoryMapU32Pointer + 0];
	console.log('Last key press @', lastKeyPress);
	
	const videoMemory = memory.HEAPU32[memoryMapU32Pointer + 1];
	console.log('Video memory @', videoMemory);

	const textMemory = memory.HEAPU32[memoryMapU32Pointer + 2];
	console.log('Text memory @', textMemory);

	const fontMemory = memory.HEAPU32[memoryMapU32Pointer + 3];
	console.log('Font memory @', fontMemory);

	memory.MemoryMap.instance = new memory.MemoryMap(lastKeyPress, videoMemory, textMemory, fontMemory);
}

function _set_display_mode(width: number, height: number, paletteSize: number, palettePointer: number) {
	console.log(`Setting display mode ${width}x${height} with ${paletteSize} colors.`);
					
	const palette: Array<Color> = [];
	
	for (let offset = 0; offset < paletteSize * 3; offset += 3) {
		const red = memory.HEAPU8[palettePointer + offset + 0];
		const green = memory.HEAPU8[palettePointer + offset + 1];
		const blue = memory.HEAPU8[palettePointer + offset + 2];
		const c = new Color(red, green, blue);
		palette.push(c);
	}

	console.log('Palette:')
	console.table(palette);

	while (palette.length < 256) {
		palette.push(Color.black());
	}

	graphics.setDisplayMode(new DisplayMode(width, height, palette));
}

export function main() {
	console.info(`${Date.now()}: Starting the bootloade.?`);

	// Load the operating system.
	fetch(settings.URL_KERNEL_WASM)
		.then(response => response.arrayBuffer())
		.then(bytes => WebAssembly.instantiate(bytes, {
			js: {
				mem: memory.memory
			},
			env: {
				emscripten_resize_heap: memory.emscripten_resize_heap,
				serial_write: (file: serial.StandardFile, dataPointer: number) => serial.serial_write(memory.memory, file, dataPointer),
				_set_display_mode: _set_display_mode,
				trace: (channel: number, data: number) => serial.trace(channel, data),
			},
			wasi_snapshot_preview1: wasi_imports
		}))
		.then(results => {
			let exports: IKernelExports = (results.instance.exports as unknown) as IKernelExports;
			memory.setMemory(exports.memory);

			// Initialize.
			exports.main();
			loadMemoryMap(exports.get_memory_map());
			graphics.link(memory.memory.buffer, memory.MemoryMap.instance.videoMemory);

			// systick
			setInterval(() => exports.irq_handler(settings.TIM_IRQ), settings.TICK_INTERVAL_MS);

			document.addEventListener('keypress', function (e: KeyboardEvent) {
				// Write in memory.
				memory.HEAP8[memory.MemoryMap.instance.lastKeyPress] = e.key.charCodeAt(0); // Get the ASCII character indicated by this key press.
				exports.irq_handler(settings.KEY_IRQ);
			});
		});
}
