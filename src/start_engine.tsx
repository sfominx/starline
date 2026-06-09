import { LocalStorage, showToast, Toast } from "@raycast/api";
import { LOCAL_STORAGE } from "./starline/constants";
import StarLine from "./starline/api";

async function startEngineCOmmand() {
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
    await starline.startEngine(defaultDevice.toString());
    await showToast(Toast.Style.Success, "Engine started");
}

export default startEngineCOmmand;
