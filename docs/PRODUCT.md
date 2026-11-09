# Product notes

What GRKU is for, who uses it, and the rules the site and the camera screens follow. The brand sheet is [brand.md](brand.md); the roadmap is [roadmap.md](roadmap.md).

## One sentence

GRKU gives a RICOH GR the looks of real films, from the SD card, so that a GR owner in Thailand (and then everywhere) gets the pictures they imagined without flashing anything.

## Where it comes from

GRKU grew out of [GRKit](https://github.com/ahonn/GRKit) and is its own project now. GRKit proved the idea: the camera runs a script from the card, the script installs modules in RAM, and the modules change the picture pipeline and the menus. GRKU keeps that core and turns it into a product: a wide film library with icons people recognize, recipes, more modules, a one-shot start, a Thai-first site that writes the card, and a small paid tier that pays for the work.

## Users

Owners of the GR III, GR IIIx and GR IV, HDF and Monochrome included. Photographers, not developers. In Thailand they come from the Ricoh GR Thailand Facebook group, friends' photos and TikTok; elsewhere from Reddit, Xiaohongshu and the GRKit community. They open the site on a phone first and on a computer with a card reader when they install.

What they want, in their words: "ได้โทนฟิล์มโดยไม่ต้องแต่งรูป" (film tones without editing), "ไม่กล้าแฟลชเฟิร์มแวร์" (afraid of flashing firmware), "อยากได้สูตรเหมือนคนอื่น" (the recipes other people use).

## What the site must do

1. Show the looks on real photos before anything is written. The preview is the emotional peak.
2. Put a chosen set of looks and modules on the card in a few clicks, from Chrome or Edge, and offer the ZIP for every other browser.
3. Explain the camera side in plain Thai: where GRKU is in ADJ, what Recipes are, what U1 to U3 do.
4. Sell GRKU Plus with one PromptPay QR and deliver the key by email, without an account.
5. Keep working when the catalog is slow or offline: the page renders without the catalog, and the installer tells the truth about what it is writing.

Success: a first-time user installs without reading the guide twice; a returning user updates the card in a minute; a buyer gets the key within a minute of paying.

## Voice and look

Thai first, short sentences, plain words, friendly. The camera's own English terms stay English (Image Control, Positive Film, Saturation): Thai users read the camera in English. One red thing per screen. The page is dark, built from shadcn/ui, and the film boxes, tiles and photos bring the color.

Anti-references: SaaS landing pages with hero metrics and gradient text; firmware-mod sites that look dangerous; pastel "photo app" styling.

## Principles

1. One clear next step on every screen.
2. Show before writing: the card changes are listed, and nothing is written until the user confirms.
3. Camera-native: names, order and icons follow the GR menus and the recipe sites people already read.
4. Never flash. The camera's firmware is never changed, and the site never asks for a firmware file.
5. Honest about risk: the risk notice is prominent, the recovery guide is one click away.

## Accessibility and languages

WCAG 2.2 AA, visible keyboard focus, reduced motion respected. Six languages (Thai, English, Simplified and Traditional Chinese, Japanese, Korean), so layouts hold longer and shorter text. Every Thai string goes through the translation tools with the English as source, never by hand in the code.

## Money

Everything that GRKit had stays free, and more: ten looks of any kind on the card, every module, recipes, the library ZIP. GRKU Plus (199 baht once, or 79 for 25 slots, or 49 for a brand pack) pays for the hosting, the camera tests and the time. The service verifies a PromptPay slip through EasySlip and sends a key from noreply@grku.app; it stores an order, a slip reference and an entitlement, nothing else.
