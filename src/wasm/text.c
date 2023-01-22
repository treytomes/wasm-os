#include <stdbool.h>
#include <stdint.h>
#include <string.h>
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

void Cursor_set_foreground(uint8_t color) {
    color &= 0x0F;
    cursor.attribute &= 0xF0;
    cursor.attribute += color;
}

void Cursor_set_background(uint8_t color) {
    color <<= 4;
    color &= 0xF0;
    cursor.attribute &= 0x0F;
    cursor.attribute += color;
}

void Cursor_set_position(uint8_t column, uint8_t row) {
    cursor.column = column;
    cursor.row = row;
}

int text_get_offset(uint8_t column, uint8_t row) {
    int text_columns = DisplayMode_get_text_columns(current_display_mode);
    int stride = text_columns * BYTES_PER_TEXT_CELL;
    return row * stride + column;
}

void text_plotch(uint8_t column, uint8_t row, uint8_t attribute, char ch) {
    int offset = text_get_offset(column, row);
    memory_map->TEXT_MEMORY[offset] = ch;
    memory_map->TEXT_MEMORY[offset + 1] = attribute;
    
    uint8_t bg = (attribute & 0xF0) >> 4;
    uint8_t fg = attribute & 0x0F;
    drawch(column * COLUMNS_PER_CHARACTER, row * ROWS_PER_CHARACTER, fg, bg, ch);
}

char text_getch(uint8_t column, uint8_t row) {
    int offset = text_get_offset(column, row);
    return memory_map->TEXT_MEMORY[offset];

}

uint8_t text_get_attribute(uint8_t column, uint8_t row) {
    int offset = text_get_offset(column, row);
    return memory_map->TEXT_MEMORY[offset + 1];
}

void text_scroll() {
    int text_rows = DisplayMode_get_text_rows(current_display_mode);
    int text_columns = DisplayMode_get_text_columns(current_display_mode);
    int stride = text_columns * BYTES_PER_TEXT_CELL;

    int num_bytes = (text_rows - 1) * stride;
    int start_offset = stride;

    // Copy everything up 1 row.
    memcpy((void*)(memory_map->TEXT_MEMORY), (void*)((int)memory_map->TEXT_MEMORY + stride), num_bytes);

    // 0 out the last row.
    memset((void*)((int)memory_map->TEXT_MEMORY + stride * (text_rows - 1)), 0, stride);

    // Copy everything up 1 row.
    num_bytes = current_display_mode->pixel_width * (current_display_mode->pixel_height - ROWS_PER_CHARACTER);
    start_offset = current_display_mode->pixel_width * ROWS_PER_CHARACTER;
    memcpy((void*)(memory_map->VIDEO_MEMORY), (void*)((int)memory_map->VIDEO_MEMORY + start_offset), num_bytes);

    // 0 out the last row.
    num_bytes = current_display_mode->pixel_width * ROWS_PER_CHARACTER;
    start_offset = current_display_mode->pixel_width * current_display_mode->pixel_height - num_bytes;
    memset((void*)((int)memory_map->VIDEO_MEMORY + start_offset), 0, num_bytes);



    /*
    for (int row = 0; row < text_rows; row++) {
        for (int column = 0; column < text_columns; column++) {
            text_plotch(column, row, text_get_attribute(column, row), text_getch(column, row));
        }
    }
    */


    /*
    for (int row = 1; row < text_rows; row++) {
        for (int column = 0; column < text_columns; column++) {
            char ch = text_getch(column, row);
            uint8_t attr = text_get_attribute(column, row);
            text_plotch(column, row - 1, attr, ch);
        }
    }
    */

    // Clear the final row.
    /*
    for (int column = 0; column < text_columns; column++) {
        text_plotch(column, text_rows - 1, 0x07, ' '); //cursor.attribute, ' ');
    }
    */
}

void text_increment_cursor() {
    int text_rows = DisplayMode_get_text_rows(current_display_mode);
    int text_columns = DisplayMode_get_text_columns(current_display_mode);
    cursor.column++;
    if (cursor.column >= text_columns) {
        cursor.column = 0;
        cursor.row++;
        if (cursor.row >= text_rows) {
            text_scroll();
            cursor.row = text_rows - 1;
        }
    }
}

void text_putch(char ch) {
    text_plotch(cursor.column, cursor.row, cursor.attribute, ch);
    text_increment_cursor();
}

void text_clear() {
    int text_rows = DisplayMode_get_text_rows(current_display_mode);
    int text_columns = DisplayMode_get_text_columns(current_display_mode);
    for (int row = 0; row < text_rows; row++) {
        for (int column = 0; column < text_columns; column++) {
            text_plotch(column, row, cursor.attribute, ' ');
        }
    }
}
