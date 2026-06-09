import { Icon } from "@raycast/api";

import { useSelectedDeviceItem } from "../context/deviceItem";

import DeviceCommandAction, { useUpdateArmState } from "./DeviceCommand";

function ArmQuietlyAction() {
    const item = useSelectedDeviceItem();

    return (
        <DeviceCommandAction
            title="Arm Quietly"
            icon={Icon.Lock}
            successMessage="Armed quietly"
            run={(starline, deviceId) => starline.armQuietly(deviceId)}
            onSuccess={useUpdateArmState(item)}
        />
    );
}

export default ArmQuietlyAction;
