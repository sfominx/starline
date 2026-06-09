import { Icon } from "@raycast/api";

import DeviceCommandAction from "./DeviceCommand";

function AdditionalSensorBypassAction() {
    return (
        <DeviceCommandAction
            title="Additional Sensor Bypass"
            icon={Icon.LivestreamDisabled}
            successMessage="Additional sensor bypassed"
            run={(starline, deviceId) => starline.additionalSensorBypass(deviceId)}
        />
    );
}

export default AdditionalSensorBypassAction;
