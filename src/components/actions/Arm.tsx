import { Icon } from "@raycast/api";

import { useSelectedDeviceItem } from "../context/deviceItem";

import DeviceCommandAction, { useUpdateArmState } from "./DeviceCommand";

function ArmAction() {
    const item = useSelectedDeviceItem();

    return (
        <DeviceCommandAction
            title="Arm"
            icon={Icon.Lock}
            successMessage="Armed"
            run={(starline, deviceId) => starline.arm(deviceId)}
            onSuccess={useUpdateArmState(item)}
        />
    );
}

export default ArmAction;
