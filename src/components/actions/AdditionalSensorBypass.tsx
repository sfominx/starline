import { Action, Icon, Toast, showToast } from "@raycast/api";
import React from "react";

import { StarLine } from "../../starline/api";
import { useSelectedDeviceItem } from "../context/deviceItem";

function AdditionalSensorBypassAction() {
    const selectedItem = useSelectedDeviceItem();

    const handleAction = async () => {
        const starline = new StarLine();
        await starline.additionalSensorBypass(selectedItem.device_id.toString());
        await showToast(Toast.Style.Success, "Additional sensor bypassed");
    };

    return (
        <Action
            title="Additional Sensor Bypass"
            icon={Icon.LivestreamDisabled}
            onAction={handleAction}
        />
    );
}

export default AdditionalSensorBypassAction;
