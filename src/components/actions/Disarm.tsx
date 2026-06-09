import { Alert, Icon } from "@raycast/api";

import { useSelectedDeviceItem } from "../context/deviceItem";

import DeviceCommandAction, { useUpdateArmState } from "./DeviceCommand";

function DisarmAction() {
    const item = useSelectedDeviceItem();

    return (
        <DeviceCommandAction
            title="Disarm"
            icon={Icon.LockUnlocked}
            shortcut={{ modifiers: ["cmd"], key: "d" }}
            successMessage="Disarmed"
            confirmation={{
                title: "Disarm vehicle?",
                message: "This will disable security mode for the selected device.",
                primaryActionTitle: "Disarm",
                style: Alert.ActionStyle.Destructive,
            }}
            run={(starline, deviceId) => starline.disarm(deviceId)}
            onSuccess={useUpdateArmState(item)}
        />
    );
}

export default DisarmAction;
