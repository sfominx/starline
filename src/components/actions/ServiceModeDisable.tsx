import { Action, Toast, showToast } from "@raycast/api";
import React from "react";

import { StarLine } from "../../starline/api";
import { useSelectedDeviceItem } from "../context/deviceItem";

function ServiceModeDisableAction() {
    const selectedItem = useSelectedDeviceItem();

    const handleAction = async () => {
        const starline = new StarLine();
        await starline.serviceModeDisable(selectedItem.device_id.toString());
        await showToast(Toast.Style.Success, "Service mode disabled");
    };

    return <Action title="Disable Service Mode" onAction={handleAction} />;
}

export default ServiceModeDisableAction;
