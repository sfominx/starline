import { Icon } from "@raycast/api";

import DeviceCommandAction from "./DeviceCommand";

function TiltSensorBypassAction() {
    return (
        <DeviceCommandAction
            title="Tilt Sensor Bypass"
            icon={Icon.ClearFormatting}
            successMessage="Tilt sensor bypassed"
            run={(starline, deviceId) => starline.tiltSensorBypass(deviceId)}
        />
    );
}

export default TiltSensorBypassAction;
