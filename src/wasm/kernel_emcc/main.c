#include <emscripten.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include "graphics.h"
#include "system.h"
#include "text.h"

struct MemoryMap* memory_map;

int SYSTICK;

#define MAX_ISR 16
#define TIM_IRQ 0
#define KEY_IRQ 1
typedef void (*isr)();
isr NVIC[MAX_ISR];

uint8_t color = 0;
uint8_t ch = 'A';

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
	//draw_filled_rect(100, 100, 150, 200, color);

	/*
	int ch = 0;
	int offset = 0;
	for (int row = 0; row < 16; row++) {
		for (int column = 0; column < 16; column++) {
			drawch(32 + column * 8, 32 + row * 8, color, (color + 9) % 16, ch);
			ch++;
		}
	}
	*/
	Cursor_set_background(color);
	Cursor_set_foreground((color + 9) % 16);
	text_putch(ch);
	ch++;
	if (ch > 'Z') {
		ch = 'A';
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
	Cursor_set_foreground(7);
	Cursor_set_background(1);
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