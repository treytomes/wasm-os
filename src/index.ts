import './assets/favicon.svg';
import * as bootloader from './bootloader';

function initializeEnvironment() {
	// TODO: Setup the terminal.
}

function onWindowLoad() {
	initializeEnvironment();
	bootloader.main();
}

window.addEventListener('load', onWindowLoad, false);
