import { Action, Icon, LocalStorage, Toast, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { LOCAL_STORAGE } from "../../starline/constants";
import { useOptionalDevicesContext } from "../../context/devices";

function UnsetAsDefaultDeviceAction() {
    const selectedItem = useSelectedDeviceItem();
    const devicesContext = useOptionalDevicesContext();

    const handleAction = async () => {
        await LocalStorage.removeItem(LOCAL_STORAGE.DEFAULT_DEVICE);
        await devicesContext?.toggleDefault(selectedItem, false);
        await showToast(Toast.Style.Success, `Device "${selectedItem.alias}" unset default`);
    };

    return <Action title="Unset as Default Device" icon={Icon.Star} onAction={handleAction} />;
}

export default UnsetAsDefaultDeviceAction;
