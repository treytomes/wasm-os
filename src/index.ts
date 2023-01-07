import './assets/favicon.svg';
import './style.css';
import * as bootloader from './bootloader';
//import { DisplayMode } from './graphics/DisplayMode';
import * as graphics from './graphics/init';
//import { memory } from './system/memory';

function onRenderFrame(time: number) {
    graphics.refresh(time);
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
