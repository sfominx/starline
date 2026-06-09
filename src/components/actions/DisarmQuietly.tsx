import { Alert, Icon } from "@raycast/api";

import { useSelectedDeviceItem } from "../context/deviceItem";

import DeviceCommandAction, { useUpdateArmState } from "./DeviceCommand";

function DisarmQuietlyAction() {
    const item = useSelectedDeviceItem();

    return (
        <DeviceCommandAction
            title="Disarm Quietly"
            icon={Icon.LockUnlocked}
            successMessage="Disarmed quietly"
            confirmation={{
                title: "Disarm quietly?",
                message: "This will disable security mode without sound confirmation.",
                primaryActionTitle: "Disarm Quietly",
                style: Alert.ActionStyle.Destructive,
            }}
            run={(starline, deviceId) => starline.disarmQuietly(deviceId)}
            onSuccess={useUpdateArmState(item)}
        />
    );
}

export default DisarmQuietlyAction;
