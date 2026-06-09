import React from "react";
import { Action, Icon, Toast, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { StarLine } from "../../starline/api";

function StopEngineAction() {
    const selectedItem = useSelectedDeviceItem();

    const handleAction = async () => {
        const starline = new StarLine();
        await starline.stopEngine(selectedItem.device_id.toString());
        await showToast(Toast.Style.Success, "Engine stopped");
    };

    return (
        <Action
            title="Stop Engine"
            icon={Icon.Stop}
            shortcut={{ modifiers: ["cmd"], key: "s" }}
            onAction={handleAction}
        />
    );
}

export default StopEngineAction;
