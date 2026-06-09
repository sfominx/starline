import { Action, Alert, Toast, confirmAlert, showToast } from "@raycast/api";

import { useOptionalDevicesContext } from "../../context/devices";
import { StarLine } from "../../starline/api";
import { DEVICE_ACTIONS } from "../../starline/commandConfig";
import { useSelectedDeviceItem } from "../context/deviceItem";

import type { DeviceActionKey, DeviceCommandConfig } from "../../starline/commandConfig";
import type { CarStatus, Item } from "../../types/devices";

function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Unknown error";
}

function isConfirmed(confirmation: DeviceCommandConfig["confirmation"], fallbackTitle: string) {
    if (confirmation === undefined) {
        return true;
    }

    return confirmAlert({
        title: confirmation.title,
        message: confirmation.message,
        primaryAction: {
            title: confirmation.primaryActionTitle ?? fallbackTitle,
            style: confirmation.style ?? Alert.ActionStyle.Default,
        },
    });
}

function useArmStateUpdater(selectedItem: Item, enabled: boolean | undefined) {
    const devicesContext = useOptionalDevicesContext();

    if (enabled !== true) {
        return undefined;
    }

    return (result: unknown) => {
        if (devicesContext === null) {
            return;
        }

        const status = result as CarStatus;
        const devices = devicesContext.devices.map((device) =>
            device.device_id === selectedItem.device_id
                ? { ...device, car_state: { ...device.car_state, arm: status.arm === "1" } }
                : device,
        );

        devicesContext.updateState({ devices, isLoading: false, captchaNeeded: false });
    };
}

function DeviceCommandAction(config: DeviceCommandConfig) {
    const item = useSelectedDeviceItem();
    const updateArmState = useArmStateUpdater(item, config.updatesArmState);

    const handleAction = async () => {
        if (!(await isConfirmed(config.confirmation, config.title))) {
            return;
        }

        const toast = await showToast(Toast.Style.Animated, config.title);

        try {
            const result = await config.run(new StarLine(), item.device_id.toString(), item);
            updateArmState?.(result);
            toast.style = Toast.Style.Success;
            toast.title = config.successMessage;
        } catch (error) {
            toast.style = Toast.Style.Failure;
            toast.title = `${config.title} failed`;
            toast.message = errorMessage(error);
        }
    };

    return (
        <Action
            title={config.title}
            icon={config.icon}
            shortcut={config.shortcut}
            onAction={handleAction}
        />
    );
}

export function ConfiguredDeviceCommandAction({ command }: { command: DeviceActionKey }) {
    return <DeviceCommandAction {...DEVICE_ACTIONS[command]} />;
}

export default DeviceCommandAction;
