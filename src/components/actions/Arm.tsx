import React from "react";
import { Action, Icon, Toast, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { StarLine } from "../../starline/api";

function ArmAction() {
    const selectedItem = useSelectedDeviceItem();

    const handleAction = async () => {
        const starline = new StarLine();
        await starline.arm(selectedItem.device_id.toString());
        await showToast(Toast.Style.Success, "Armed");
    };

    return <Action title="Arm" icon={Icon.Lock} onAction={handleAction} />;
}

export default ArmAction;
