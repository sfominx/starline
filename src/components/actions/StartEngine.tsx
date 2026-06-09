import React from "react";
import { Action, Icon, Toast, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { StarLine } from "../../starline/api";

function StartEngineAction() {
    const selectedItem = useSelectedDeviceItem();

    const handleAction = async () => {
        const starline = new StarLine();
        await starline.startEngine(selectedItem.device_id.toString());
        await showToast(Toast.Style.Success, "Engine started");
    };

    return (
        <Action
            title="Start Engine"
            icon={Icon.Play}
            shortcut={{ modifiers: ["cmd"], key: "return" }}
            onAction={handleAction}
        />
    );
}

export default StartEngineAction;
