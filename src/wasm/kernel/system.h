#ifndef __SYSTEM_H__
#define __SYSTEM_H__

enum StandardFile {
	SF_DEBUG = 0,
	SF_INFO = 1,
	SF_ERROR = 2
};

struct MemoryMap {
	/**
	 * The location of the ascii code for the most recent key press.
	 */
	uint8_t* LAST_KEY_PRESS;

	/**
	 * Pixels should be drawn to this location.
	 */
	uint8_t* VIDEO_MEMORY;

	/**
	 * Text should be written to this locaton.
	 */
	uint8_t* TEXT_MEMORY;

	/**
	 * The font is stored here.
	 */
	uint8_t* FONT_MEMORY;
};

extern struct MemoryMap* memory_map;

/**
 * BEGIN JAVASCRIPT FUNCTIONS
 */

/**
 * @brief Write output to the JavaScript console.
 * 
 * @param channel Choose whether to write to the debug, info, or error streams.
 * @param data 
 */
extern void serial_write(enum StandardFile channel, const char* data);

/**
 * @brief Send data to JavaScript.
 */
extern void trace(int channel, int data);

/**
 * END JAVASCRIPT FUNCTIONS
 */

#endif
