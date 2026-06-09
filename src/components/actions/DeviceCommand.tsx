import { Action, Alert, Toast, confirmAlert, showToast } from "@raycast/api";

import { useOptionalDevicesContext } from "../../context/devices";
import { StarLine } from "../../starline/api";
import { useSelectedDeviceItem } from "../context/deviceItem";

import type { Item, CarStatus } from "../../types/devices";
import type { ComponentProps } from "react";

type DeviceCommandConfirmation = {
    title: string;
    message?: string;
    primaryActionTitle?: string;
    style?: Alert.ActionStyle;
};

type DeviceCommandProps = {
    title: string;
    icon?: ComponentProps<typeof Action>["icon"];
    shortcut?: ComponentProps<typeof Action>["shortcut"];
    successMessage: string;
    confirmation?: DeviceCommandConfirmation;
    run: (starline: StarLine, deviceId: string, item: Item) => Promise<unknown>;
    onSuccess?: (result: unknown) => void;
};

function confirmCommand(confirmation: DeviceCommandConfirmation | undefined, title: string) {
    if (confirmation === undefined) {
        return true;
    }

    return confirmAlert({
        title: confirmation.title,
        message: confirmation.message,
        primaryAction: {
            title: confirmation.primaryActionTitle ?? title,
            style: confirmation.style ?? Alert.ActionStyle.Default,
        },
    });
}

function DeviceCommandAction(props: DeviceCommandProps) {
    const { title, icon, shortcut, successMessage, confirmation, run, onSuccess } = props;
    const item = useSelectedDeviceItem();

    const handleAction = async () => {
        if (!(await confirmCommand(confirmation, title))) {
            return;
        }

        const toast = await showToast(Toast.Style.Animated, title);

        try {
            const result = await run(new StarLine(), item.device_id.toString(), item);
            onSuccess?.(result);
            toast.style = Toast.Style.Success;
            toast.title = successMessage;
        } catch (error) {
            toast.style = Toast.Style.Failure;
            toast.title = `${title} failed`;
            toast.message = error instanceof Error ? error.message : "Unknown error";
        }
    };

    return <Action title={title} icon={icon} shortcut={shortcut} onAction={handleAction} />;
}

export function useUpdateArmState(selectedItem: Item) {
    const devicesContext = useOptionalDevicesContext();

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

export default DeviceCommandAction;
