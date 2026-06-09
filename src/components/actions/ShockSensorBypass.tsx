import { Icon } from "@raycast/api";

import DeviceCommandAction from "./DeviceCommand";

function ShockSensorBypassAction() {
    return (
        <DeviceCommandAction
            title="Shock Sensor Bypass"
            icon={Icon.BoltDisabled}
            successMessage="Shock sensor bypassed"
            run={(starline, deviceId) => starline.shockSensorBypass(deviceId)}
        />
    );
}

export default ShockSensorBypassAction;
