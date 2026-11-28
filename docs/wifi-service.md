# Wi-Fi service

> **Off in GRKU for now.** GRKU has no phone app yet, so releases ship the service off: a release package has no `SERVE.BIN` (the release workflow adds it only with the repository variable `GRKU_WIFI=on`), the resident part of the loader has none of its lines (`WIFI_SERVICE` in `crates/grku-core/src/runtime/loader.rs`), and INSTALL opens the mailbox only when the card has `SCRIPT/GRKU/SERVE.BIN` and the switch file `GRKU/WIFI.ON` (`wifi_enabled` in `runtime/installer.c`). To test the service, set `WIFI_SERVICE` to `true`, build the runtimes with `grku build --serve SERVE.BIN`, package them, and put an empty `GRKU/WIFI.ON` on the card. The rest of this page describes the service as GRKit made it.

The Wi-Fi service lets the GRKU phone app manage the camera over the camera's Wi-Fi. It is `SERVE.BIN`, a program on the card that runs on the camera's Linux. With the service, the app can:

- Read and change the Film Looks, their covers, and their order.
- Read, add, apply, and change recipes.
- Read and change module settings, the ADJ layout, GRKU Settings, and the shutdown picture.
- Send an official GRKU update, which the person confirms on the camera.

The app finds and joins the camera with Bluetooth and the camera's own Wi-Fi functions. The service does not replace them.

## Lifecycle

The resident loader starts the service with `SCAN.SH serve` when the camera's access point comes up. It stops the service when the access point goes down. The service runs a copy of itself from RAM, so no file on the card stays open while it runs. If the service stops, `SCAN.SH` starts it again a limited number of times.

Each start of the service has a new `bootId`. A camera without a connected phone has no added timer wake-ups.

## Requests

The service listens on port 8080 of the camera, next to the camera's own HTTP API on port 80. Each path starts with `/v1/`. The service answers one request on each connection and then closes it. `/v1/changes` is a WebSocket that stays open and reports which resource changed.

JSON uses camelCase. An error is `application/problem+json` (RFC 9457). The app reads its `code` field. The `detail` field is only for diagnostics.

[`crates/grku-serve/src/route.rs`](../crates/grku-serve/src/route.rs) gives each path, its methods, and its body. The areas are:

| Area | Paths |
| --- | --- |
| Camera and service | `/ping`, `/props`, `/changes` |
| Film Looks | `/looks`, `/looks/<id>`, `/looks/<id>/content`, `/params/looks/order` |
| Recipes | `/recipes`, `/recipes/<id>`, `/recipes/<id>/apply`, `/recipes/order`, `/recipes/undo` |
| Modules | `/modules/catalog`, `/modules/<id>/icon`, `/params/modules`, `/params/modules/<id>`, `/params/modules/order`, `/params/modules/layout` |
| GRKU Settings | `/params/settings`, `/shutdown-picture` |
| Software | `/update`, `/update/cancel` |

## Access

The camera's local network is the trust boundary. There is no account and no Internet login. The service limits access from a web browser:

- The `Host` header must name the local address and port of the service.
- A request with an `Origin` header is rejected, also on the WebSocket.
- Each change carries `X-GRKU-Boot-Id` with the `bootId` that the app last read. Another value returns 409 `context_changed`, because the camera started again.

These checks do not authenticate a native client on the same network. Software code needs an official signature. Data that the app sends is decoded and checked before it is written, and a name from the app never becomes a card path.

## How changes apply

The service sends each setting change through a mailbox in camera RAM ([`runtime/control_mailbox.h`](../runtime/control_mailbox.h)). The App task of the camera answers in its next poll and stores the change as the matching MENU row does. These changes apply at once:

- A setting of a module or of GRKU Settings, and the ADJ layout.
- A Look on or off, and the order of the Looks.
- A recipe that is added, changed, applied, undone, or deleted.

The camera reads its Look files only when it starts, so a new or changed Look file applies at the next start. After the service writes or removes the shutdown picture, the camera checks it at once, and the next power-off shows the change.

A GRKU page keeps its rows while it shows, so the camera does not change a value under an open page ([`runtime/control.h`](../runtime/control.h)):

- While the GRKU menu of ADJ shows, a change closes ADJ first. ADJ does not store the row that is highlighted and not confirmed. The service then sends the change again, and it applies.
- While another GRKU page shows, a change returns 503 `camera_busy`. These pages are a development, the GRKU settings pages of MENU, and the information page with a GRKU view. A native page that GRKU opened from ADJ also counts.

If the camera does not answer, the service returns 503. `runtime_busy` means that the change was not sent, so the app can send it again. `runtime_late` means that the camera can still make the change, so the app reads the resource before it tries again.

## Software updates

1. The app sends a signed package to `PUT /update`. The service checks the signature before it decompresses the other files. The signed statement must name this camera and its firmware.
2. The service writes the files that change to the update folder of the card and reads each one back. It writes the request last.
3. The camera shows an Update row on the MOD page of ADJ and in GRKU Settings of MENU. The person confirms the update in one of them.
4. The camera installs the update at its next start.

The app can cancel an update with `POST /update/cancel` until the person confirms it. While an update waits, the service rejects other changes with 409 `software_pending`.

An update carries no Looks. It does not change a Look file of the card. The service keeps a record of each request on the card. With it, the service reports the outcome after a restart or a power loss ([`crates/grku-serve/src/update/`](../crates/grku-serve/src/update/)).

## Card access

Linux reaches the card through `ipcufs`, which sends each file operation by path to the RTOS. The RTOS keeps the only file system of the card. The card does not follow all desktop file rules, so the service follows these rules ([`crates/grku-serve/src/update/mod.rs`](../crates/grku-serve/src/update/mod.rs)):

- It does not rename a file over another file, and it does not rename or delete a folder.
- Before it deletes a file in a folder, it looks up each name of that folder. On GR IV, a new name in a folder can stay unfound after a delete until the next start.
- Linux keeps the result of a lookup of a name that does not exist. The service reads a folder to find a file that the camera creates.

## Code

| Path | Contents |
| --- | --- |
| [`crates/grku-serve/`](../crates/grku-serve/) | The service: transport, routes, resources, updates, and the mailbox client |
| [`runtime/control*.h`](../runtime/) | The commands of the mailbox in the camera runtime |
| [`runtime/menu_update.h`](../runtime/menu_update.h) | The Update row and its confirmation |
| [`crates/grku-core/src/abi/control.rs`](../crates/grku-core/src/abi/control.rs) | The mailbox layout, its commands, and its result codes |
