import React from "react";
import { Action, Icon, Toast, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { StarLine } from "../../starline/api";

function ArmQuietlyAction() {
    const selectedItem = useSelectedDeviceItem();

    const handleAction = async () => {
        const starline = new StarLine();
        await starline.armQuietly(selectedItem.device_id.toString());
        await showToast(Toast.Style.Success, "Armed quietly");
    };

    return <Action title="Arm Quietly" icon={Icon.Lock} onAction={handleAction} />;
}

export default ArmQuietlyAction;
