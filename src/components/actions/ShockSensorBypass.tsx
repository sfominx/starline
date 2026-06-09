import React from "react";
import { Action, Icon, Toast, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { StarLine } from "../../starline/api";

function ShockSensorBypassAction() {
    const selectedItem = useSelectedDeviceItem();

    const handleAction = async () => {
        const starline = new StarLine();
        await starline.shockSensorBypass(selectedItem.device_id.toString());
        await showToast(Toast.Style.Success, "Shock sensor bypassed");
    };

    return <Action title="Shock Sensor Bypass" icon={Icon.BoltDisabled} onAction={handleAction} />;
}

export default ShockSensorBypassAction;
