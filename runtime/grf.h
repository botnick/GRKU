#ifndef GRKU_GRF_H
#define GRKU_GRF_H

/* A GRFX0001 record has GRKU_GRF_SIZE bytes, or GRKU_GRF_MAX_SIZE with hue
   levels (feature 16). runtime/abi.h has the layout. */
#include "abi.h"

/* Return one only for a complete, supported GRFX0001 record of `size` bytes. */
int grku_grf_validate(const unsigned char *data, unsigned long size);

#endif
