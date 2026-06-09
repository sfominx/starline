import { type Alert, Icon } from "@raycast/api";

import { useSelectedDeviceItem } from "../context/deviceItem";

import DeviceCommandAction from "./DeviceCommand";

import type { Item } from "../../types/devices";

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

function isCommandSupported(command: string, item: Item) {
    const supportedCommands = new Set([
        ...item.functions,
        ...item.controls.map((control) => control.type),
    ]);

    return supportedCommands.size === 0 || supportedCommands.has(command);
}

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
    const item = useSelectedDeviceItem();

    if (requireSupported && !isCommandSupported(command, item)) {
        return null;
    }

    return (
        <DeviceCommandAction
            title={title}
            icon={icon}
            successMessage={successMessage}
            confirmation={confirmation}
            run={(starline, deviceId) =>
                starline.sendCommandWithAsyncFallback(deviceId, command, value)
            }
        />
    );
}

export default CommandAction;
