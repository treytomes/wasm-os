import { Color } from "./Color";

export class DisplayMode {
	width: number;
	height: number;
	palette: Array<Color>;

	constructor(width: number, height: number, palette: Array<Color>) {
		this.width = width;
		this.height = height;
		this.palette = palette;
	}
}
