#include <emscripten.h>
#include <string.h>

/**
 * @brief Send data to JavaScript.
 */
extern void trace(int channel, int data);

int SYSTICK;

#define MEM_LASTKEYPRESS 0x1000

#define MAX_ISR 16
#define TIM_IRQ 0
#define KEY_IRQ 1
typedef void (*isr)();
isr NVIC[MAX_ISR];

void tim_isr() {
    trace(1, SYSTICK++);
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
    trace(0, 12345);
    
    // Initial tick value.
    SYSTICK = 0;

    // Interrupt vector table setup.
    memset(NVIC, 0, sizeof(NVIC));
    NVIC[TIM_IRQ] = &tim_isr;
    NVIC[KEY_IRQ] = &key_isr;
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

/**
 * END EXPORTED FUNCTIONS
 */