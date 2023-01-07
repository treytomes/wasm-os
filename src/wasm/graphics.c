#include "graphics.h"
#include <stdlib.h>

struct Color Color_new(uint8_t _r, uint8_t _g, uint8_t _b) {
	struct Color c;
	c.red = _r;
	c.green = _g;
	c.blue = _b;
	return c;
}

struct Color* generate_palette_cga() {
	struct Color* palette = malloc(sizeof(struct Color) * 16);
	palette[0] = Color_new(0, 0, 0);
	palette[1] = Color_new(0, 0, 0xAA);
	palette[2] = Color_new(0, 0xAA, 0);
	palette[3] = Color_new(0, 0xAA, 0xAA);
	palette[4] = Color_new(0xAA, 0, 0);
	palette[5] = Color_new(0xAA, 0, 0xAA);
	palette[6] = Color_new(0xAA, 0x55, 0);
	palette[7] = Color_new(0xAA, 0xAA, 0xAA);
	palette[8] = Color_new(0x55, 0x55, 0x55);
	palette[9] = Color_new(0x55, 0x55, 0xFF);
	palette[10] = Color_new(0x55, 0xFF, 0x55);
	palette[11] = Color_new(0x55, 0xFF, 0xFF);
	palette[12] = Color_new(0xFF, 0x55, 0x55);
	palette[13] = Color_new(0xFF, 0x55, 0xFF);
	palette[14] = Color_new(0xFF, 0xFF, 0x55);
	palette[15] = Color_new(0xFF, 0xFF, 0xFF);
	return palette;
}

uint8_t get_color3(uint8_t r, uint8_t g, uint8_t b) {
	r = r % 6;
	g = g % 6;
	b = b % 6;
	return r * 36 + g * 6 + b;
}

uint8_t get_color1(uint16_t value) {
	uint8_t b = (value % 10);
	uint8_t g = ((int)(value / 10)) % 10;
	uint8_t r = ((int)(value / 100)) % 10;
	return 108; //r * 36 + g * 6 + b;
}
