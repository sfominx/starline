import React from "react";
import { Action, Alert, Icon, Toast, confirmAlert, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { StarLine } from "../../starline/api";

function StopEngineAction() {
    const selectedItem = useSelectedDeviceItem();

    const handleAction = async () => {
        const confirmed = await confirmAlert({
            title: "Stop engine?",
            message: "This will stop the engine remotely.",
            primaryAction: {
                title: "Stop Engine",
                style: Alert.ActionStyle.Destructive,
            },
        });

        if (!confirmed) return;

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
