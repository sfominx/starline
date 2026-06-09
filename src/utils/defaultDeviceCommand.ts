import { LocalStorage, Toast, showToast } from "@raycast/api";

import { StarLine } from "../starline/api";
import { DEVICE_ACTIONS } from "../starline/commandConfig";
import { LOCAL_STORAGE } from "../starline/constants";

import type { DeviceActionKey } from "../starline/commandConfig";

function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Unknown error";
}

export default async function defaultDeviceCommand(command: DeviceActionKey) {
    const config = DEVICE_ACTIONS[command];
    const deviceId = await LocalStorage.getItem(LOCAL_STORAGE.DEFAULT_DEVICE);

    if (deviceId === undefined) {
        await showToast(
            Toast.Style.Failure,
            "No default device",
            "Please set default device first",
        );
        return;
    }

    const toast = await showToast(Toast.Style.Animated, config.title);

    try {
        await config.run(new StarLine(), deviceId.toString());
        toast.style = Toast.Style.Success;
        toast.title = config.successMessage;
    } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = "Command failed";
        toast.message = errorMessage(error);
    }
}
