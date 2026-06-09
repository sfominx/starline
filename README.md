# Starline

Raycast extension for managing StarLine devices from Raycast.

## Setup

Add the required Raycast extension preferences:

- **Application ID** — `AppId` from the StarLine developer portal.
- **Secret** — `Secret` from the StarLine developer portal.
- **Login** — StarLine account login.
- **Password** — StarLine account password.

Open **Devices** first, confirm login/captcha if prompted, and set a default device from the action panel if you want to use no-view quick commands.

## Commands

- **Devices** — list devices, set default device, run actions, and open device details.
- **Arm** / **Disarm** — control the default device.
- **Start Engine** / **Stop Engine** — remote engine commands for the default device, with confirmation.
- **Arm Quietly** / **Disarm Quietly** — quiet security commands for the default device.
- **Horn** — send horn/poke command to the default device.
- **Update Position** — request a fresh position update for the default device.

## Device view features

The device action panel exposes supported primary commands, advanced commands, and read-only detail screens for state, position, controls, OBD, settings, events, tracks, and reports. Development mode also exposes raw JSON mutation forms for advanced API experimentation.

## Security and storage

The extension does not persist StarLine bearer tokens or cookies in Raycast LocalStorage. Auth secrets are cached only in memory for the current process using the configured TTLs. LocalStorage is used for captcha metadata, the StarLine user id, and the selected default device.

## Limitations

- Some OpenAPI endpoints are still planned; see `STARLINE_API_IMPLEMENTATION_PLAN.md` for current status.
- Settings mutation forms are raw JSON and intended for development/advanced use.
- Real device behavior can vary by firmware and supported controls.
