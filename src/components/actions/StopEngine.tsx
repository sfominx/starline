import { Alert, Icon } from "@raycast/api";

import DeviceCommandAction from "./DeviceCommand";

function StopEngineAction() {
    return (
        <DeviceCommandAction
            title="Stop Engine"
            icon={Icon.Stop}
            shortcut={{ modifiers: ["cmd"], key: "s" }}
            successMessage="Engine stopped"
            confirmation={{
                title: "Stop engine?",
                message: "This will stop the engine remotely.",
                primaryActionTitle: "Stop Engine",
                style: Alert.ActionStyle.Destructive,
            }}
            run={(starline, deviceId) => starline.stopEngine(deviceId)}
        />
    );
}

export default StopEngineAction;
