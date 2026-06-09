import { Action, Alert, Icon, Toast, confirmAlert, showToast } from "@raycast/api";

import { useOptionalDevicesContext } from "../../context/devices";
import { StarLine } from "../../starline/api";
import { useSelectedDeviceItem } from "../context/deviceItem";

function DisarmAction() {
    const selectedItem = useSelectedDeviceItem();
    const devicesContext = useOptionalDevicesContext();

    const handleAction = async () => {
        const confirmed = await confirmAlert({
            title: "Disarm vehicle?",
            message: "This will disable security mode for the selected device.",
            primaryAction: {
                title: "Disarm",
                style: Alert.ActionStyle.Destructive,
            },
        });

        if (!confirmed) {
            return;
        }

        const starline = new StarLine();
        const data = await starline.disarm(selectedItem.device_id.toString());
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
