#ifndef __TEXT_H__
#define __TEXT_H__

void Cursor_set_foreground(uint8_t color);
void Cursor_set_background(uint8_t color);
void Cursor_set_position(uint8_t column, uint8_t row);
int text_get_offset(uint8_t column, uint8_t row);
void text_plotch(uint8_t column, uint8_t row, uint8_t attribute, char ch);
char text_getch(uint8_t column, uint8_t row);
uint8_t text_get_attribute(uint8_t column, uint8_t row);
void text_scroll();
void text_increment_cursor();
void text_putch(char ch);
void text_clear();

#endif
