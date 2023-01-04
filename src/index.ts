import './assets/favicon.svg';
import './style.css';
import * as bootloader from './bootloader';
//import { DisplayMode } from './graphics/DisplayMode';
import * as graphics from './graphics/init';
//import { memory } from './system/memory';

function onRenderFrame(time: number) {
    graphics.beginRender();

	/*
	const mem = new Uint8Array(memory.buffer); //.subarray(0xA000, 0xA000 + graphics.displayMode.width * graphics.displayMode.height);

	//mem.subarray(0).fill(palette.getColor(30));
	mem.subarray(graphics.VIDEO_MEMORY).fill(palette.getColor(3));
	//mem.fill(palette.getColor(514));
	
	// TODO: Draw everything here.
	for (let x = 100; x < 150; x++) {
		for (let y = 100; y < 150; y++) {
			//graphics.setPixel(x, y, palette.getColor(531));
			mem[graphics.VIDEO_MEMORY + y * graphics.displayMode.width + x] = palette.getColor(555);
		}
	}
	*/


    graphics.endRender();
	//console.log('Key press from index: ', (new Uint8Array(memory.buffer))[settings.MEM_LASTKEYPRESS]);
    requestAnimationFrame(onRenderFrame);
}

function initializeEnvironment() {
	// TODO: Setup the terminal.
	graphics.initialize();
	//graphics.setDisplayMode(new DisplayMode(80 * 8, 25 * 8, palette.generatePalette()));

	//graphics.link(memory.buffer, 0xA0000);

	// Begin the render loop.
    requestAnimationFrame(onRenderFrame);
}

function onWindowLoad() {
	initializeEnvironment();
	bootloader.main();
}

window.addEventListener('load', onWindowLoad, false);
