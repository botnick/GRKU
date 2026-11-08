#ifndef GRKIT_INSTALL_TEXT_H
#define GRKIT_INSTALL_TEXT_H
/* A part of the installer: text built in a buffer, for a line of the boot
   log, the report, and the failure file. installer.c includes it after
   install_io.h. Each function appends at *n in a buffer of `max` bytes,
   keeps room for the NUL, and drops what does not fit. */
__attribute__((noinline)) static void text_add(char *buffer, u32 *n, u32 max, const char *text)
{
    while (*text && *n + 1 < max) buffer[(*n)++] = *text++;
    buffer[*n] = 0;
}
__attribute__((noinline)) static void text_dec(char *buffer, u32 *n, u32 max, u32 value)
{
    char digits[11]; u32 k = sizeof(digits);
    digits[--k] = 0;
    do { digits[--k] = (char)('0' + value % 10); value /= 10; } while (value);
    text_add(buffer, n, max, digits + k);
}
__attribute__((noinline)) static void text_hex(char *buffer, u32 *n, u32 max, u32 value)
{
    char digits[11]; u32 k = 0;
    digits[k++] = '0'; digits[k++] = 'x';
    for (int shift = 28; shift >= 0; shift -= 4) digits[k++] = "0123456789abcdef"[(value >> shift) & 15];
    digits[k] = 0;
    text_add(buffer, n, max, digits);
}
#endif
