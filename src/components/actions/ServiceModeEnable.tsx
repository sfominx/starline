import { Action, Toast, showToast } from "@raycast/api";
import React from "react";

import { StarLine } from "../../starline/api";
import { useSelectedDeviceItem } from "../context/deviceItem";

function ServiceModeEnableAction() {
    const selectedItem = useSelectedDeviceItem();

    const handleAction = async () => {
        const starline = new StarLine();
        await starline.serviceModeEnable(selectedItem.device_id.toString());
        await showToast(Toast.Style.Success, "Service mode enabled");
    };

    return <Action title="Enable Service Mode" onAction={handleAction} />;
}

export default ServiceModeEnableAction;
