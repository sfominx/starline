import { LocalStorage, showToast, Toast } from "@raycast/api";
import { LOCAL_STORAGE } from "./starline/constants";
import StarLine from "./starline/api";

async function stopEngineCommand() {
    const defaultDevice = await LocalStorage.getItem(LOCAL_STORAGE.DEFAULT_DEVICE);

    if (defaultDevice === undefined) {
        await showToast(
            Toast.Style.Failure,
            "No default device",
            "Please set default device first",
        );
        return;
    }

    const starline = new StarLine();
    await starline.stopEngine(defaultDevice.toString());
    await showToast(Toast.Style.Success, "Engine stopped");
}

export default stopEngineCommand;
