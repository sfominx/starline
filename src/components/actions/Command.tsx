import { Icon } from "@raycast/api";

import { useSelectedDeviceItem } from "../context/deviceItem";

import DeviceCommandAction from "./DeviceCommand";

import type { DeviceCommandConfig, DeviceCommandValue } from "../../starline/commandConfig";
import type { Item } from "../../types/devices";

type CommandActionProps = {
    title: string;
    command: string;
    value?: DeviceCommandValue;
    icon?: Icon;
    successMessage?: string;
    confirmation?: DeviceCommandConfig["confirmation"];
    requireSupported?: boolean;
};

function isCommandSupported(command: string, item: Item) {
    const functions = item.functions ?? [];
    const controls = item.controls ?? [];

    if (functions.length === 0 && controls.length === 0) {
        return true;
    }

    return functions.includes(command) || controls.some(({ type }) => type === command);
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
