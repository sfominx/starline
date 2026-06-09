import { Icon } from "@raycast/api";

import DeviceCommandAction from "./DeviceCommand";

function StartEngineAction() {
    return (
        <DeviceCommandAction
            title="Start Engine"
            icon={Icon.Play}
            shortcut={{ modifiers: ["cmd"], key: "return" }}
            successMessage="Engine started"
            confirmation={{
                title: "Start engine?",
                message: "Make sure it is safe to start the engine remotely.",
                primaryActionTitle: "Start Engine",
            }}
            run={(starline, deviceId) => starline.startEngine(deviceId)}
        />
    );
}

export default StartEngineAction;
