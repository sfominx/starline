import { Alert, Icon, type Image, type Keyboard } from "@raycast/api";

import type { StarLine } from "./api";
import type { Item } from "../types/devices";

export type DeviceCommandValue = string | number | boolean;

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

const destructiveConfirmation = (
    title: string,
    message: string,
    primaryActionTitle: string,
): CommandConfirmation => ({
    title,
    message,
    primaryActionTitle,
    style: Alert.ActionStyle.Destructive,
});

const deviceCommand = (
    title: string,
    successMessage: string,
    run: DeviceCommandConfig["run"],
    options: Omit<DeviceCommandConfig, "title" | "successMessage" | "run"> = {},
): DeviceCommandConfig => ({ title, successMessage, run, ...options });

export const DEVICE_ACTIONS = {
    arm: deviceCommand("Arm", "Armed", (starline, deviceId) => starline.arm(deviceId), {
        icon: Icon.Lock,
        updatesArmState: true,
    }),
    startEngine: deviceCommand(
        "Start Engine",
        "Engine started",
        (starline, deviceId) => starline.startEngine(deviceId),
        {
            icon: Icon.Play,
            shortcut: { modifiers: ["cmd"], key: "return" },
            confirmation: {
                title: "Start engine?",
                message: "Make sure it is safe to start the engine remotely.",
                primaryActionTitle: "Start Engine",
            },
        },
    ),
    disarm: deviceCommand("Disarm", "Disarmed", (starline, deviceId) => starline.disarm(deviceId), {
        icon: Icon.LockUnlocked,
        shortcut: { modifiers: ["cmd"], key: "d" },
        confirmation: destructiveConfirmation(
            "Disarm vehicle?",
            "This will disable security mode for the selected device.",
            "Disarm",
        ),
        updatesArmState: true,
    }),
    stopEngine: deviceCommand(
        "Stop Engine",
        "Engine stopped",
        (starline, deviceId) => starline.stopEngine(deviceId),
        {
            icon: Icon.Stop,
            shortcut: { modifiers: ["cmd"], key: "s" },
            confirmation: destructiveConfirmation(
                "Stop engine?",
                "This will stop the engine remotely.",
                "Stop Engine",
            ),
        },
    ),
    armQuietly: deviceCommand(
        "Arm Quietly",
        "Armed quietly",
        (starline, deviceId) => starline.armQuietly(deviceId),
        {
            icon: Icon.Lock,
            updatesArmState: true,
        },
    ),
    disarmQuietly: deviceCommand(
        "Disarm Quietly",
        "Disarmed quietly",
        (starline, deviceId) => starline.disarmQuietly(deviceId),
        {
            icon: Icon.LockUnlocked,
            confirmation: destructiveConfirmation(
                "Disarm quietly?",
                "This will disable security mode without sound confirmation.",
                "Disarm Quietly",
            ),
            updatesArmState: true,
        },
    ),
    shockSensorBypass: deviceCommand(
        "Shock Sensor Bypass",
        "Shock sensor bypassed",
        (starline, deviceId) => starline.shockSensorBypass(deviceId),
        { icon: Icon.BoltDisabled },
    ),
    tiltSensorBypass: deviceCommand(
        "Tilt Sensor Bypass",
        "Tilt sensor bypassed",
        (starline, deviceId) => starline.tiltSensorBypass(deviceId),
        { icon: Icon.ClearFormatting },
    ),
    additionalSensorBypass: deviceCommand(
        "Additional Sensor Bypass",
        "Additional sensor bypassed",
        (starline, deviceId) => starline.additionalSensorBypass(deviceId),
        { icon: Icon.LivestreamDisabled },
    ),
    serviceModeEnable: deviceCommand(
        "Enable Service Mode",
        "Service mode enabled",
        (starline, deviceId) => starline.serviceModeEnable(deviceId),
    ),
    serviceModeDisable: deviceCommand(
        "Disable Service Mode",
        "Service mode disabled",
        (starline, deviceId) => starline.serviceModeDisable(deviceId),
    ),
    horn: deviceCommand(
        "Horn",
        "Horn command sent",
        (starline, deviceId) => starline.horn(deviceId),
        {
            icon: Icon.SpeakerUp,
        },
    ),
    updatePosition: deviceCommand(
        "Update Position",
        "Position update requested",
        (starline, deviceId) => starline.updatePosition(deviceId),
        { icon: Icon.Map },
    ),
} satisfies Record<string, DeviceCommandConfig>;

export type DeviceActionKey = keyof typeof DEVICE_ACTIONS;

export const PRIMARY_DEVICE_ACTIONS = Object.keys(DEVICE_ACTIONS) as DeviceActionKey[];
