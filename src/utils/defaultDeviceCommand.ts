import { LocalStorage, Toast, showToast } from "@raycast/api";
import StarLine from "../starline/api";
import { LOCAL_STORAGE } from "../starline/constants";

type DefaultDeviceCommandOptions = {
    successMessage: string;
    run: (starline: StarLine, deviceId: string) => Promise<unknown>;
};

export default async function defaultDeviceCommand(options: DefaultDeviceCommandOptions) {
    const { successMessage, run } = options;
    const defaultDevice = await LocalStorage.getItem(LOCAL_STORAGE.DEFAULT_DEVICE);

    if (defaultDevice === undefined) {
        await showToast(
            Toast.Style.Failure,
            "No default device",
            "Please set default device first",
        );
        return;
    }

    const toast = await showToast(Toast.Style.Animated, successMessage);

    try {
        const starline = new StarLine();
        await run(starline, defaultDevice.toString());
        toast.style = Toast.Style.Success;
        toast.title = successMessage;
    } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = "Command failed";
        toast.message = error instanceof Error ? error.message : "Unknown error";
    }
}
