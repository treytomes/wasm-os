export class Color {
	red: number;
	green: number;
	blue: number;
	alpha: number;

	constructor(red: number, green: number, blue: number, alpha: number = 255) {
		this.red = red;
		this.blue = blue;
		this.green = green;
		this.alpha = alpha;
	}

	static black() {
		return new Color(0, 0, 0);
	}

	static white() {
		return new Color(255, 255, 255);
	}
}