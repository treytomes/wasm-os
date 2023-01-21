#include <stdbool.h>
#include <stdint.h>
#include "graphics.h"
#include "system.h"
#include "text.h"

struct Cursor {
    uint8_t attribute;
    uint8_t row;
    uint8_t column;
    bool is_blinking;
};

struct Cursor cursor;

void putch(char ch) {
    int text_rows = DisplayMode_get_text_rows(current_display_mode);
    int text_columns = DisplayMode_get_text_columns(current_display_mode);
    int stride = text_rows * BYTES_PER_TEXT_CELL;
    memory_map->TEXT_MEMORY[cursor.row * stride + cursor.column] = ch;
    memory_map->TEXT_MEMORY[cursor.row * stride + cursor.column + 1] = cursor.attribute;
}