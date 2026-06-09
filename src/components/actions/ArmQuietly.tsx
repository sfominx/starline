import { Action, Icon, Toast, showToast } from "@raycast/api";

import { useOptionalDevicesContext } from "../../context/devices";
import { StarLine } from "../../starline/api";
import { useSelectedDeviceItem } from "../context/deviceItem";

function ArmQuietlyAction() {
    const selectedItem = useSelectedDeviceItem();
    const devicesContext = useOptionalDevicesContext();

    const handleAction = async () => {
        const starline = new StarLine();
        const data = await starline.armQuietly(selectedItem.device_id.toString());

        if (devicesContext !== null) {
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
        await showToast(Toast.Style.Success, "Armed quietly");
    };

    return <Action title="Arm Quietly" icon={Icon.Lock} onAction={handleAction} />;
}

export default ArmQuietlyAction;
