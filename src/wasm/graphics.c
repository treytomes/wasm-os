#include "graphics.h"

struct Color Color_new(uint8_t _r, uint8_t _g, uint8_t _b) {
	struct Color c;
	c.red = _r;
	c.green = _g;
	c.blue = _b;
	return c;
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
