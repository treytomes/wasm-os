import { Color } from '../Color';

/**
 * Generate a palette with 6 increments each of red, green, and blue.
 */
export function generatePalette(paletteSize: number = 256): Array<Color> {
    let colors = [];
    for (let v = 0; v < paletteSize; v++) {
        colors[v] = new Color(v, v, v);
    }
	return colors;
}
