#include <stdlib.h>
#include "graphics.h"
#include "system.h"

struct DisplayMode display_modes[1];
struct DisplayMode* current_display_mode;

struct Color Color_new(uint8_t _r, uint8_t _g, uint8_t _b) {
	struct Color c;
	c.red = _r;
	c.green = _g;
	c.blue = _b;
	return c;
}

int DisplayMode_get_text_rows(struct DisplayMode* mode) {
	return mode->pixel_height / ROWS_PER_CHARACTER;
}

int DisplayMode_get_text_columns(struct DisplayMode* mode) {
	return mode->pixel_width / COLUMNS_PER_CHARACTER;
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

void setup_display_modes() {
	display_modes[0].pixel_width = 320;
	display_modes[0].pixel_height = 240;
	display_modes[0].palette_size = 16;
	display_modes[0].palette = generate_palette_cga();
	display_modes[0].text_mode = false;
}

void set_display_mode(int display_mode_index) {
	current_display_mode = &display_modes[display_mode_index];
	if (memory_map->VIDEO_MEMORY != 0) {
		free(memory_map->VIDEO_MEMORY);
	}
	memory_map->VIDEO_MEMORY = (uint8_t*)malloc(current_display_mode->pixel_width * current_display_mode->pixel_height);

	if (memory_map->TEXT_MEMORY != 0) {
		free(memory_map->TEXT_MEMORY);
	}
	int text_rows = DisplayMode_get_text_rows(current_display_mode);
	int text_columns = DisplayMode_get_text_columns(current_display_mode);
	memory_map->TEXT_MEMORY = (uint8_t*)malloc(text_rows * text_columns * BYTES_PER_TEXT_CELL);

	_set_display_mode(current_display_mode->pixel_width, current_display_mode->pixel_height, current_display_mode->palette_size, current_display_mode->palette);
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
