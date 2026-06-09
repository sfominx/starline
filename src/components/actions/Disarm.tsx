import React from "react";
import { Action, Icon, Toast, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { StarLine } from "../../starline/api";

function DisarmAction() {
    const selectedItem = useSelectedDeviceItem();

    const handleAction = async () => {
        const starline = new StarLine();
        await starline.disarm(selectedItem.device_id.toString());
        await showToast(Toast.Style.Success, "Disarmed");
    };

    return (
        <Action
            title="Disarm"
            icon={Icon.LockUnlocked}
            shortcut={{ modifiers: ["cmd"], key: "d" }}
            onAction={handleAction}
        />
    );
}

export default DisarmAction;
