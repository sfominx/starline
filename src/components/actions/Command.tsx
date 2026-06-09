import { Icon } from "@raycast/api";

import { isCommandSupported } from "../../starline/commandSupport";
import { useSelectedDeviceItem } from "../context/deviceItem";

import DeviceCommandAction from "./DeviceCommand";

import type { DeviceCommandConfig, DeviceCommandValue } from "../../starline/commandConfig";

type CommandActionProps = {
    title: string;
    command: string;
    value?: DeviceCommandValue;
    icon?: Icon;
    successMessage?: string;
    confirmation?: DeviceCommandConfig["confirmation"];
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
