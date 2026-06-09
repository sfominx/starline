import React from "react";
import { Action, Alert, Icon, Toast, confirmAlert, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { StarLine } from "../../starline/api";

type CommandActionProps = {
    title: string;
    command: string;
    value?: string | number | boolean;
    icon?: Icon;
    successMessage?: string;
    confirmation?: {
        title: string;
        message?: string;
        primaryActionTitle?: string;
        style?: Alert.ActionStyle;
    };
    requireSupported?: boolean;
};

function CommandAction(props: CommandActionProps) {
    const {
        title,
        command,
        value = 1,
        icon = Icon.Gear,
        successMessage = title,
        confirmation,
        requireSupported = true,
    } = props;
    const selectedItem = useSelectedDeviceItem();

    const supportedCommands = new Set<string>([
        ...(selectedItem.functions || []),
        ...(selectedItem.controls || []).map((control) => control.type),
    ]);

    if (requireSupported && supportedCommands.size > 0 && !supportedCommands.has(command)) {
        return null;
    }

    const handleAction = async () => {
        if (confirmation) {
            const confirmed = await confirmAlert({
                title: confirmation.title,
                message: confirmation.message,
                primaryAction: {
                    title: confirmation.primaryActionTitle || title,
                    style: confirmation.style || Alert.ActionStyle.Default,
                },
            });

            if (!confirmed) return;
        }

        const starline = new StarLine();
        await starline.sendCommand(selectedItem.device_id.toString(), command, value);
        await showToast(Toast.Style.Success, successMessage);
    };

    return <Action title={title} icon={icon} onAction={handleAction} />;
}

export default CommandAction;
