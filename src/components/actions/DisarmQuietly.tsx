import React from "react";
import { Action, Icon, Toast, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { StarLine } from "../../starline/api";

function DisarmQuietlyAction() {
    const selectedItem = useSelectedDeviceItem();

    const handleAction = async () => {
        const starline = new StarLine();
        await starline.disarmQuietly(selectedItem.device_id.toString());
        await showToast(Toast.Style.Success, "Disarmed quietly");
    };

    return <Action title="Disarm Quietly" icon={Icon.LockUnlocked} onAction={handleAction} />;
}

export default DisarmQuietlyAction;
