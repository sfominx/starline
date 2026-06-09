import { LocalStorage, Toast, showToast } from "@raycast/api";

import { StarLine } from "../starline/api";
import { DEVICE_ACTIONS } from "../starline/commandConfig";
import { LOCAL_STORAGE } from "../starline/constants";

import { runDeviceCommand } from "./runDeviceCommand";

import type { DeviceActionKey } from "../starline/commandConfig";

export const createDefaultDeviceCommand = (command: DeviceActionKey) => () =>
    defaultDeviceCommand(command);

export default async function defaultDeviceCommand(command: DeviceActionKey) {
    const deviceId = await LocalStorage.getItem(LOCAL_STORAGE.DEFAULT_DEVICE);

    if (deviceId === undefined) {
        await showToast(
            Toast.Style.Failure,
            "No default device",
            "Please set default device first",
        );
        return;
    }

    await runDeviceCommand({
        ...DEVICE_ACTIONS[command],
        deviceId: deviceId.toString(),
        starline: new StarLine(),
    });
}
