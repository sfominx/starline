import { Action, Alert, Icon, Toast, confirmAlert, showToast } from "@raycast/api";
import React from "react";

import { StarLine } from "../../starline/api";
import { useSelectedDeviceItem } from "../context/deviceItem";

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
        ...selectedItem.functions,
        ...selectedItem.controls.map((control) => control.type),
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
                    style: confirmation.style ?? Alert.ActionStyle.Default,
                },
            });

            if (!confirmed) {
                return;
            }
        }

        const toast = await showToast(Toast.Style.Animated, title);

        try {
            const starline = new StarLine();
            await starline.sendCommandWithAsyncFallback(
                selectedItem.device_id.toString(),
                command,
                value,
            );
            toast.style = Toast.Style.Success;
            toast.title = successMessage;
        } catch (error) {
            toast.style = Toast.Style.Failure;
            toast.title = "Command failed";
            toast.message = error instanceof Error ? error.message : "Unknown error";
        }
    };

    return <Action title={title} icon={icon} onAction={handleAction} />;
}

export default CommandAction;
