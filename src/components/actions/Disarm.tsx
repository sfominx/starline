import { Action, Icon, Toast, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { StarLine } from "../../starline/api";
import { useDevicesContext } from "../../context/devices";

function DisarmAction() {
    const selectedItem = useSelectedDeviceItem();
    const { devices, updateState } = useDevicesContext();

    const handleAction = async () => {
        const starline = new StarLine();
        const data = await starline.disarm(selectedItem.device_id.toString());
        devices.forEach((device) => {
            if (device.device_id === selectedItem.device_id) {
                device.car_state.arm = data.arm === "1";
            }
        });

        const stateUpdate = {
            devices,
            isLoading: false,
            captchaNeeded: false,
        };

        updateState(stateUpdate);

        await showToast(Toast.Style.Success, "Disarmed");
    };

    return (
        <Action
            title="Disarm"
            icon={Icon.LockUnlocked}
            shortcut={{ modifiers: ["cmd"], key: "d" }}
            onAction={handleAction}
        />
    );
}

export default DisarmAction;
