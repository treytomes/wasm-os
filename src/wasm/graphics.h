#ifndef __GRAPHICS_H__
#define __GRAPHICS_H__

#include <stdint.h>

struct Color {
	uint8_t red;
	uint8_t green;
	uint8_t blue;
};

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
extern void set_display_mode(int width, int height, int paletteSize, struct Color palette[]);

/**
 * END JAVASCRIPT FUNCTIONS
 */

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
