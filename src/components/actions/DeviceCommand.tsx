import { Action, Alert, confirmAlert } from "@raycast/api";
import { useMemo } from "react";

import { useOptionalDevicesContext } from "../../context/devices";
import { useOptionalStarLine } from "../../context/starline";
import { StarLine } from "../../starline/api";
import { DEVICE_ACTIONS } from "../../starline/commandConfig";
import { runDeviceCommand } from "../../utils/runDeviceCommand";
import { useSelectedDeviceItem } from "../context/deviceItem";

import type { DeviceActionKey, DeviceCommandConfig } from "../../starline/commandConfig";
import type { CarStatus, Item } from "../../types/devices";

const isConfirmed = (confirmation: DeviceCommandConfig["confirmation"], fallbackTitle: string) =>
    confirmation === undefined ||
    confirmAlert({
        title: confirmation.title,
        message: confirmation.message,
        primaryAction: {
            title: confirmation.primaryActionTitle ?? fallbackTitle,
            style: confirmation.style ?? Alert.ActionStyle.Default,
        },
    });

const updateArmState = (target: Item, result: unknown) => {
    const isArmed = (result as CarStatus).arm === "1";
    return (device: Item) =>
        device.device_id === target.device_id
            ? { ...device, car_state: { ...device.car_state, arm: isArmed } }
            : device;
};

function DeviceCommandAction(config: DeviceCommandConfig) {
    const { title, icon, shortcut, confirmation, run, successMessage, updatesArmState } = config;
    const item = useSelectedDeviceItem();
    const devicesContext = useOptionalDevicesContext();
    const contextStarLine = useOptionalStarLine();
    const fallbackStarLine = useMemo(() => new StarLine(), []);
    const starline = contextStarLine ?? fallbackStarLine;

    const handleAction = async () => {
        if (!(await isConfirmed(confirmation, title))) {
            return;
        }

        const result = await runDeviceCommand({
            deviceId: item.device_id.toString(),
            item,
            run,
            starline,
            successMessage,
            title,
        });

        if (updatesArmState !== true || devicesContext === null || result === undefined) {
            return;
        }

        devicesContext.updateState(({ devices }) => ({
            devices: devices.map(updateArmState(item, result)),
            isLoading: false,
        }));
    };

    return <Action title={title} icon={icon} shortcut={shortcut} onAction={handleAction} />;
}

export function ConfiguredDeviceCommandAction({ command }: { command: DeviceActionKey }) {
    return <DeviceCommandAction {...DEVICE_ACTIONS[command]} />;
}

export default DeviceCommandAction;
