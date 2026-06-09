import { Action, Alert, Icon, Toast, confirmAlert, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { StarLine } from "../../starline/api";
import { useDevicesContext } from "../../context/devices";

function DisarmQuietlyAction() {
    const selectedItem = useSelectedDeviceItem();
    const { devices, updateState } = useDevicesContext();

    const handleAction = async () => {
        const confirmed = await confirmAlert({
            title: "Disarm quietly?",
            message: "This will disable security mode without sound confirmation.",
            primaryAction: {
                title: "Disarm Quietly",
                style: Alert.ActionStyle.Destructive,
            },
        });

        if (!confirmed) return;

        const starline = new StarLine();
        const data = await starline.disarmQuietly(selectedItem.device_id.toString());

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
        await showToast(Toast.Style.Success, "Disarmed quietly");
    };

    return <Action title="Disarm Quietly" icon={Icon.LockUnlocked} onAction={handleAction} />;
}

export default DisarmQuietlyAction;
