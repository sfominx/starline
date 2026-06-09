import { Action, Alert, Icon, Toast, confirmAlert, showToast } from "@raycast/api";

import { useOptionalDevicesContext } from "../../context/devices";
import { StarLine } from "../../starline/api";
import { useSelectedDeviceItem } from "../context/deviceItem";

function DisarmQuietlyAction() {
    const selectedItem = useSelectedDeviceItem();
    const devicesContext = useOptionalDevicesContext();

    const handleAction = async () => {
        const confirmed = await confirmAlert({
            title: "Disarm quietly?",
            message: "This will disable security mode without sound confirmation.",
            primaryAction: {
                title: "Disarm Quietly",
                style: Alert.ActionStyle.Destructive,
            },
        });

        if (!confirmed) {
            return;
        }

        const starline = new StarLine();
        const data = await starline.disarmQuietly(selectedItem.device_id.toString());

        if (devicesContext) {
            const devices = devicesContext.devices.map((device) => {
                if (device.device_id === selectedItem.device_id) {
                    return { ...device, car_state: { ...device.car_state, arm: data.arm === "1" } };
                }
                return device;
            });

            devicesContext.updateState({
                devices,
                isLoading: false,
                captchaNeeded: false,
            });
        }
        await showToast(Toast.Style.Success, "Disarmed quietly");
    };

    return <Action title="Disarm Quietly" icon={Icon.LockUnlocked} onAction={handleAction} />;
}

export default DisarmQuietlyAction;
