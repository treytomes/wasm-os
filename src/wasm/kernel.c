#include <emscripten.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include "graphics.h"

enum StandardFile {
	SF_DEBUG = 0,
	SF_INFO = 1,
	SF_ERROR = 2
};

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

uint8_t* VIDEO_MEMORY;

int SYSTICK;

#define MEM_LASTKEYPRESS 0x1000

#define MAX_ISR 16
#define TIM_IRQ 0
#define KEY_IRQ 1
typedef void (*isr)();
isr NVIC[MAX_ISR];

int displayWidth = 320;
int displayHeight = 240;
uint8_t color = 0;

void tim_isr() {
    trace(1, SYSTICK++);

	// Graphics test.

	color++;
	if (color > 15) {
		color = 0;
	}

	for (int x = 100; x < 150; x++) {
		for (int y = 100; y < 150; y++) {
			VIDEO_MEMORY[y * displayWidth + x] = color;
		}
	}
	//trace(2, get_color1(500));
}

void key_isr() {
    int* ptr = (int*)MEM_LASTKEYPRESS;
    trace(2, *ptr);
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
    trace(0, 12345);
    
    // Initial tick value.
    SYSTICK = 0;

    // Interrupt vector table setup.
    memset(NVIC, 0, sizeof(NVIC));
    NVIC[TIM_IRQ] = &tim_isr;
    NVIC[KEY_IRQ] = &key_isr;

	VIDEO_MEMORY = (uint8_t*)malloc(displayWidth * displayHeight);
	// TODO: Assign the palette from here.
	set_display_mode(displayWidth, displayHeight, 0, NULL);
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
uint8_t* get_video_memory() {
	return VIDEO_MEMORY;
}

/**
 * END EXPORTED FUNCTIONS
 */