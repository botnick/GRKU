/* The browser build of the GRKU picture modules (web/scripts/build-develop-wasm.mjs).
   Each module source is compiled for wasm32 with this header first, then the
   SDK header and the settings header that the build writes from its
   module.toml. A plane address is a pointer of the WebAssembly memory, so the
   bytes of a plane are plain memory, as on the camera. */
#ifndef GRKU_DEVELOP_H
#define GRKU_DEVELOP_H
#define GRKU_BYTES(address) ((u8 *)(address))
#include "grku.h"

/* The setting handles of the harness: setting k of a module is handle
   DEVELOP_SETTING_BASE + k. The modules run one after the other, so they
   share the values, and each glue function sets the values of its module
   before it calls it. */
#define DEVELOP_SETTING_BASE 16U
#define DEVELOP_SETTINGS 64U

/* The picture set that dev_set fills. */
extern PictureSet develop_set;
#endif
