import { Action, Icon, Toast, showToast } from "@raycast/api";
import React from "react";

import { StarLine } from "../../starline/api";
import { useSelectedDeviceItem } from "../context/deviceItem";

function TiltSensorBypassAction() {
    const selectedItem = useSelectedDeviceItem();

    const handleAction = async () => {
        const starline = new StarLine();
        await starline.tiltSensorBypass(selectedItem.device_id.toString());
        await showToast(Toast.Style.Success, "Tilt sensor bypassed");
    };

    return (
        <Action title="Tilt Sensor Bypass" icon={Icon.ClearFormatting} onAction={handleAction} />
    );
}

export default TiltSensorBypassAction;
