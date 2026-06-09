import React from "react";
import { Action, Icon, Toast, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { StarLine } from "../../starline/api";

type CommandActionProps = {
    title: string;
    command: string;
    value?: string | number | boolean;
    icon?: Icon;
    successMessage?: string;
};

function CommandAction(props: CommandActionProps) {
    const { title, command, value = 1, icon = Icon.Gear, successMessage = title } = props;
    const selectedItem = useSelectedDeviceItem();

    const handleAction = async () => {
        const starline = new StarLine();
        await starline.sendCommand(selectedItem.device_id.toString(), command, value);
        await showToast(Toast.Style.Success, successMessage);
    };

    return <Action title={title} icon={icon} onAction={handleAction} />;
}

export default CommandAction;
