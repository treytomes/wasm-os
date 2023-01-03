export default class GameCanvas {
	canvas: HTMLCanvasElement;
	screenWidth: number;
	screenHeight: number;
	isContentLoaded: boolean;

    constructor(canvas: HTMLCanvasElement = null) {
        this.canvas = (canvas ?? document.querySelector('canvas')) as HTMLCanvasElement;

        // Standard SNES resolution.
        this.screenWidth = 256;
        this.screenHeight = 224;
		this.isContentLoaded = false;
    }

    onInit() {}
	loadContent() {}

	onKeyDown(e: KeyboardEvent) {}
	onKeyUp(e: KeyboardEvent) {}
	onKeyPress(e: KeyboardEvent) {}
	
	onMouseDown(x: number, y: number, buttons: number) {}
    onMouseUp(x: number, y: number, buttons: number) {}
    onMouseMove(x: number, y: number, buttons: number) {}
    onUpdate(time: number) {}
    onRender(time: number) {}
}
