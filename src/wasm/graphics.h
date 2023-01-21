#ifndef __GRAPHICS_H__
#define __GRAPHICS_H__

#include <stdbool.h>
#include <stdint.h>

#define FONT_SIZE 256
#define COLUMNS_PER_CHARACTER 8
#define ROWS_PER_CHARACTER 8

// First byte is the character, second byte is the attribute.
#define BYTES_PER_TEXT_CELL 2

struct DisplayMode {
	int pixel_width;
	int pixel_height;
	int palette_size;
	struct Color* palette;
	bool text_mode;
};

struct Color {
	uint8_t red;
	uint8_t green;
	uint8_t blue;
};

extern struct DisplayMode display_modes[1];
extern struct DisplayMode* current_display_mode;

struct Color Color_new(uint8_t _r, uint8_t _g, uint8_t _b);

/**
 * BEGIN JAVASCRIPT FUNCTIONS
 */

/**
 * @brief Set the display mode, including the palette.
 * 
 * @param width 
 * @param height 
 * @param palette An array of red, green, blue, alpha values.
 */
extern void _set_display_mode(int width, int height, int palette_size, struct Color palette[]);

/**
 * END JAVASCRIPT FUNCTIONS
 */

void setup_display_modes();
void set_display_mode(int display_mode_index);

/**
 * Generate the array of 16 CGA colors.
 */
struct Color* generate_palette_cga();

int DisplayMode_get_text_rows(struct DisplayMode* mode);
int DisplayMode_get_text_columns(struct DisplayMode* mode);

/**
 * Convert an RGB value into a palette index.
 * 
 * Each component is a value from 0-5.
 * 
 * This function should be used along with generateRadialPalette.
 */
uint8_t get_color3(uint8_t r, uint8_t g, uint8_t b);

/**
 * Convert an RGB value into a palette index.
 * Value is a 3 digit number, where is digit is a value from 0-5 representing the RGB components.
 */
uint8_t get_color1(uint16_t value);

#endif
