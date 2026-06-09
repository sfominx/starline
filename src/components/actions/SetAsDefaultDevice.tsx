import { Action, Icon, LocalStorage, Toast, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { LOCAL_STORAGE } from "../../starline/constants";
import { useDevicesContext } from "../../context/devices";

function SetAsDefaultDeviceAction() {
    const selectedItem = useSelectedDeviceItem();
    const { toggleDefault } = useDevicesContext();

    const handleAction = async () => {
        await LocalStorage.setItem(LOCAL_STORAGE.DEFAULT_DEVICE, selectedItem.device_id.toString());
        await toggleDefault(selectedItem, true);
        await showToast(Toast.Style.Success, `Device "${selectedItem.alias}" set as default`);
    };

    return <Action title="Set as Default Device" icon={Icon.Star} onAction={handleAction} />;
}

export default SetAsDefaultDeviceAction;
