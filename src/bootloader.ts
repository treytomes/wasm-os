import * as serial from './serial';
import * as system from './system';
import settings from './settings';

interface IKernelExports {
	memory: WebAssembly.Memory;

	main: () => void;
	irq_handler: (irq: number) => void;
}

// Memory sizes are in 64Kb pages.
let memory = new WebAssembly.Memory({
	initial: settings.INITIAL_SIZE_PAGES, 
	maximum: settings.MAXIMUM_SIZE_PAGES
});

let exports;

const wasi_imports = {
	'proc_exit': system.proc_exit
};

export function main() {
	console.info(`${Date.now()}: Starting the bootloader.`);

	// Load the operating system.
	fetch(settings.URL_KERNEL_WASM)
		.then(response => response.arrayBuffer())
		.then(bytes => WebAssembly.instantiate(bytes, {
			js: {
				mem: memory
			},
			env: {
				trace: (channel: number, data: number) => serial.trace(channel, data),
				serial_write: (file: serial.StandardFile, dataPointer: number) => serial.serial_write(memory, file, dataPointer)
			},
			wasi_snapshot_preview1: wasi_imports
		}))
		.then(results => {
			let exports: IKernelExports = (results.instance.exports as unknown) as IKernelExports;
			memory = exports.memory as WebAssembly.Memory;

			// Initialize.
			exports.main();

			// systick
			setInterval(() => exports.irq_handler(settings.TIM_IRQ), settings.TICK_INTERVAL_MS);

			document.addEventListener('keypress', function (e) {
				// Write in memory.
				(new Uint8Array(memory.buffer))[settings.MEM_LASTKEYPRESS] = e.key.charCodeAt(0); // Get the ASCII character indicated by this key press.
				exports.irq_handler(settings.KEY_IRQ);
			});
		});
}
