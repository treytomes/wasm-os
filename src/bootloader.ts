import * as serial from './system/serial';
import * as process from './system/process';
import settings from './settings';
import * as memory from './system/memory';
import * as graphics from './graphics/init';
import { DisplayMode } from './graphics/DisplayMode';
import * as palette from './graphics/palettes/cga';

interface IKernelExports {
	memory: WebAssembly.Memory;

	main: () => void;
	irq_handler: (irq: number) => void;
	get_video_memory: () => number;
}

let exports;

const wasi_imports = {
	'proc_exit': process.proc_exit
};

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
				set_display_mode: (width: number, height: number, paletteSize: number, palettePointer: number) => {
					const p = palette.generatePalette(); 
					graphics.setDisplayMode(new DisplayMode(width, height, p));
				},
				trace: (channel: number, data: number) => serial.trace(channel, data),
			},
			wasi_snapshot_preview1: wasi_imports
		}))
		.then(results => {
			let exports: IKernelExports = (results.instance.exports as unknown) as IKernelExports;
			memory.setMemory(exports.memory);

			// Initialize.
			exports.main();
			console.log('Video memory @ ', exports.get_video_memory());
			graphics.link(memory.memory.buffer, exports.get_video_memory());

			// systick
			setInterval(() => exports.irq_handler(settings.TIM_IRQ), settings.TICK_INTERVAL_MS);

			document.addEventListener('keypress', function (e) {
				// Write in memory.
				(new Uint8Array(memory.memory.buffer))[settings.MEM_LASTKEYPRESS] = e.key.charCodeAt(0); // Get the ASCII character indicated by this key press.
				exports.irq_handler(settings.KEY_IRQ);
			});
		});
}
