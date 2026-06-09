import { Alert, Icon, type Image, type Keyboard } from "@raycast/api";

import type { StarLine } from "./api";
import type { Item } from "../types/devices";

type CommandConfirmation = {
    title: string;
    message?: string;
    primaryActionTitle?: string;
    style?: Alert.ActionStyle;
};

export type DeviceCommandConfig = {
    title: string;
    icon?: Image.ImageLike;
    shortcut?: Keyboard.Shortcut;
    successMessage: string;
    confirmation?: CommandConfirmation;
    updatesArmState?: boolean;
    run: (starline: StarLine, deviceId: string, item?: Item) => Promise<unknown>;
};

type DeviceActionsMap = Record<string, DeviceCommandConfig>;

function defineDeviceActions<const T extends DeviceActionsMap>(actions: T) {
    return actions;
}

export const DEVICE_ACTIONS = defineDeviceActions({
    arm: {
        title: "Arm",
        icon: Icon.Lock,
        successMessage: "Armed",
        updatesArmState: true,
        run: (starline, deviceId) => starline.arm(deviceId),
    },
    startEngine: {
        title: "Start Engine",
        icon: Icon.Play,
        shortcut: { modifiers: ["cmd"], key: "return" },
        successMessage: "Engine started",
        confirmation: {
            title: "Start engine?",
            message: "Make sure it is safe to start the engine remotely.",
            primaryActionTitle: "Start Engine",
        },
        run: (starline, deviceId) => starline.startEngine(deviceId),
    },
    disarm: {
        title: "Disarm",
        icon: Icon.LockUnlocked,
        shortcut: { modifiers: ["cmd"], key: "d" },
        successMessage: "Disarmed",
        confirmation: {
            title: "Disarm vehicle?",
            message: "This will disable security mode for the selected device.",
            primaryActionTitle: "Disarm",
            style: Alert.ActionStyle.Destructive,
        },
        updatesArmState: true,
        run: (starline, deviceId) => starline.disarm(deviceId),
    },
    stopEngine: {
        title: "Stop Engine",
        icon: Icon.Stop,
        shortcut: { modifiers: ["cmd"], key: "s" },
        successMessage: "Engine stopped",
        confirmation: {
            title: "Stop engine?",
            message: "This will stop the engine remotely.",
            primaryActionTitle: "Stop Engine",
            style: Alert.ActionStyle.Destructive,
        },
        run: (starline, deviceId) => starline.stopEngine(deviceId),
    },
    armQuietly: {
        title: "Arm Quietly",
        icon: Icon.Lock,
        successMessage: "Armed quietly",
        updatesArmState: true,
        run: (starline, deviceId) => starline.armQuietly(deviceId),
    },
    disarmQuietly: {
        title: "Disarm Quietly",
        icon: Icon.LockUnlocked,
        successMessage: "Disarmed quietly",
        confirmation: {
            title: "Disarm quietly?",
            message: "This will disable security mode without sound confirmation.",
            primaryActionTitle: "Disarm Quietly",
            style: Alert.ActionStyle.Destructive,
        },
        updatesArmState: true,
        run: (starline, deviceId) => starline.disarmQuietly(deviceId),
    },
    shockSensorBypass: {
        title: "Shock Sensor Bypass",
        icon: Icon.BoltDisabled,
        successMessage: "Shock sensor bypassed",
        run: (starline, deviceId) => starline.shockSensorBypass(deviceId),
    },
    tiltSensorBypass: {
        title: "Tilt Sensor Bypass",
        icon: Icon.ClearFormatting,
        successMessage: "Tilt sensor bypassed",
        run: (starline, deviceId) => starline.tiltSensorBypass(deviceId),
    },
    additionalSensorBypass: {
        title: "Additional Sensor Bypass",
        icon: Icon.LivestreamDisabled,
        successMessage: "Additional sensor bypassed",
        run: (starline, deviceId) => starline.additionalSensorBypass(deviceId),
    },
    serviceModeEnable: {
        title: "Enable Service Mode",
        successMessage: "Service mode enabled",
        run: (starline, deviceId) => starline.serviceModeEnable(deviceId),
    },
    serviceModeDisable: {
        title: "Disable Service Mode",
        successMessage: "Service mode disabled",
        run: (starline, deviceId) => starline.serviceModeDisable(deviceId),
    },
    horn: {
        title: "Horn",
        icon: Icon.SpeakerUp,
        successMessage: "Horn command sent",
        run: (starline, deviceId) => starline.horn(deviceId),
    },
    updatePosition: {
        title: "Update Position",
        icon: Icon.Map,
        successMessage: "Position update requested",
        run: (starline, deviceId) => starline.updatePosition(deviceId),
    },
});

export type DeviceActionKey = keyof typeof DEVICE_ACTIONS;
