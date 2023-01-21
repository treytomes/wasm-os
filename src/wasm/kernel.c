#include <emscripten.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include "graphics.h"
#include "system.h"

struct MemoryMap* memory_map;

int SYSTICK;

#define MAX_ISR 16
#define TIM_IRQ 0
#define KEY_IRQ 1
typedef void (*isr)();
isr NVIC[MAX_ISR];

uint8_t color = 0;

void tim_isr() {
    trace(1, SYSTICK++);

	// Graphics test.

	color++;
	if (color > 15) {
		color = 0;
	}

	// Draw a XOR pattern.
	/*
	for (int x = 0; x < displayWidth; x++) {
		for (int y = 0; y < displayHeight; y++) {
			uint8_t c = (x % 16) ^ (y % 16);
			memory_map->VIDEO_MEMORY[y * displayWidth + x] = c;
		}
	}
	*/

	// Draw a filled rectangle.
	/*
	for (int x = 100; x < 150; x++) {
		for (int y = 100; y < 150; y++) {
			memory_map->VIDEO_MEMORY[y * displayWidth + x] = color;
		}
	}
	*/

	// Dump the contents of font memory.
	char ch = 0;
	int offset = 0;
	for (int row = 0; row < 16; row++) {
		for (int column = 0; column < 16; column++) {
			for (int yd = 0; yd < 8; yd++) {
				uint8_t byte = memory_map->FONT_MEMORY[offset];
				for (int xd = 7; xd >= 0; xd--) {
					int x = 16 + column * 9 + xd;
					int y = 16 + row * 9 + yd;

					if ((byte & 0x01) == 1) {
						memory_map->VIDEO_MEMORY[y * current_display_mode->pixel_width + x] = (color + 9) % 16;
					} else {
						memory_map->VIDEO_MEMORY[y * current_display_mode->pixel_width + x] = color;
					}

					byte = byte >> 1;
				}
				offset++;
			}
			ch++;
		}
	}
}

void key_isr() {
	uint8_t ch = *(uint8_t*)memory_map->LAST_KEY_PRESS;
    trace(2, ch);
}

/**
 * BEGIN EXPORTED FUNCTIONS
 */

/**
 * @brief Initialization function for the OS.
 */
EMSCRIPTEN_KEEPALIVE
int main() {
	serial_write(SF_INFO, "Starting the kernel.");
    //trace(0, 12345);
    
    // Initial tick value.
    SYSTICK = 0;

    // Interrupt vector table setup.
    memset(NVIC, 0, sizeof(NVIC));
    NVIC[TIM_IRQ] = &tim_isr;
    NVIC[KEY_IRQ] = &key_isr;

	memory_map = (struct MemoryMap*)malloc(sizeof(struct MemoryMap));
	memory_map->LAST_KEY_PRESS = (uint8_t*)malloc(1);
	memory_map->FONT_MEMORY = (uint8_t*)malloc(FONT_SIZE * ROWS_PER_CHARACTER);
	memory_map->VIDEO_MEMORY = 0;
	memory_map->TEXT_MEMORY = 0;

	setup_display_modes();
	set_display_mode(0);
}

EMSCRIPTEN_KEEPALIVE
void irq_handler(int irq) {
    if ((irq < 0) || (irq >= MAX_ISR)) {
        return;
    }
    if (NVIC[irq]) {
        NVIC[irq]();
    }
}

EMSCRIPTEN_KEEPALIVE
struct MemoryMap* get_memory_map() {
	return memory_map;
}

/**
 * END EXPORTED FUNCTIONS
 */