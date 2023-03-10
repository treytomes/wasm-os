import './assets/favicon.svg';
import './style.css';
import * as bootloader from './bootloader';
import * as graphics from './graphics/init';
import Jimp from 'jimp';
import OEM437_8 from './assets/OEM437_8.png';
import * as memory from './system/memory';

function onRenderFrame(time: number) {
    graphics.refresh(time);
    requestAnimationFrame(onRenderFrame);
}

function initializeEnvironment() {
	graphics.initialize();

	// Begin the render loop.
    requestAnimationFrame(onRenderFrame);
}

function loadFont() {
	const colorKey = 0x000000FF;
	Jimp.read(OEM437_8).then(image => {
		let ch = 0;
		let ptr = memory.MemoryMap.instance.fontMemory;
		for (let row = 0; row < 16; row++) {
			for (let column = 0; column < 16; column++) {
				let x = column * 8;
				let y = row * 8;

				for (let yd = 0; yd < 8; yd++) {
					let byte = 0;
					for (let xd = 0; xd < 8; xd++) {
						byte = byte << 1;
						const clr = image.getPixelColor(x + xd, y + yd);
						if (clr !== colorKey) {
							byte = byte + 1;
						}
					}

					memory.HEAPU8[ptr] = byte;
					ptr++;
				}
				ch++;
			}
		}
	});
}

async function onWindowLoad() {
	initializeEnvironment();
	await bootloader.main();
	loadFont();
}

window.addEventListener('load', onWindowLoad, false);
