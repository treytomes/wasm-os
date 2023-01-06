import { Color } from '../Color';

/**
 * Generate the CGA palette.
 */
export function generatePalette(paletteSize: number = 256): Array<Color> {
    let colors = [];
    for (let v = 0; v < paletteSize; v++) {
        colors[v] = new Color(0, 0, 0);
    }
	colors[0] = new Color(0, 0, 0);
	colors[1] = new Color(0, 0, 0xAA);
	colors[2] = new Color(0, 0xAA, 0);
	colors[3] = new Color(0, 0xAA, 0xAA);
	colors[4] = new Color(0xAA, 0, 0);
	colors[5] = new Color(0xAA, 0, 0xAA);
	colors[6] = new Color(0xAA, 0x55, 0);
	colors[7] = new Color(0xAA, 0xAA, 0xAA);
	colors[8] = new Color(0x55, 0x55, 0x55);
	colors[9] = new Color(0x55, 0x55, 0xFF);
	colors[10] = new Color(0x55, 0xFF, 0x55);
	colors[11] = new Color(0x55, 0xFF, 0xFF);
	colors[12] = new Color(0xFF, 0x55, 0x55);
	colors[13] = new Color(0xFF, 0x55, 0xFF);
	colors[14] = new Color(0xFF, 0xFF, 0x55);
	colors[15] = new Color(0xFF, 0xFF, 0xFF);
	return colors;
}
