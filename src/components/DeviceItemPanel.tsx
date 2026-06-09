import { Action, ActionPanel, Alert, Icon, environment } from "@raycast/api";

import ClearAuthCacheAction from "./actions/ClearAuthCache";
import CommandAction from "./actions/Command";
import DefaultDeviceAction from "./actions/DefaultDevice";
import { ConfiguredDeviceCommandAction } from "./actions/DeviceCommand";
import DeviceApiDetail from "./DeviceApiDetail";
import DeviceDetails from "./DeviceDetails";
import DeviceJsonMutationForm from "./DeviceJsonMutationForm";
import { useSelectedDeviceItem } from "./context/deviceItem";
import { PRIMARY_DEVICE_ACTIONS } from "../starline/commandConfig";

import type { ComponentProps } from "react";
import type { DeviceApiDetailKind } from "./DeviceApiDetail";
import type { DeviceJsonMutationKind } from "./DeviceJsonMutationForm";
import type { DeviceCommandValue } from "../starline/commandConfig";

type PanelItem<TKind extends string> = { title: string; kind: TKind; icon: Icon };
type RawCommand = {
    title: string;
    command: string;
    value?: DeviceCommandValue;
    icon?: Icon;
    successMessage?: string;
    confirmation?: ComponentProps<typeof CommandAction>["confirmation"];
};

const RAW_COMMAND_TYPES = {
    handsFree: "hfree",
    disarmTrunk: "disarm_trunk",
    panic: "panic",
    balance: "getbalance",
    output: "out",
    dvr: "dvr",
    webasto: "webasto",
    webastoOn: "webasto_on",
    webastoOff: "webasto_off",
    flex: (index: number) => `flex_${index}`,
} as const;

const DETAIL_ITEMS = [
    ["Supported Controls", "controls", Icon.List],
    ["Live State", "state", Icon.Heartbeat],
    ["Position", "position", Icon.Map],
    ["Device Info", "info", Icon.Info],
    ["Full Device Data", "data", Icon.Document],
    ["Summary Report", "report", Icon.BarChart],
    ["Settings", "settings", Icon.Gear],
    ["Comfort Options", "comfortOptions", Icon.Window],
    ["Events / Last 24h", "events", Icon.Clock],
    ["Track / Last 24h", "ways", Icon.Map],
    ["Driving Score", "drivingScore", Icon.BarChart],
    ["Driving Score History", "drivingScoreHistory", Icon.BarChart],
    ["OBD Params", "obdParams", Icon.Gauge],
    ["OBD Errors", "obdErrors", Icon.ExclamationMark],
] as const satisfies ReadonlyArray<readonly [string, DeviceApiDetailKind, Icon]>;

const JSON_FORM_ITEMS = [
    ["Update Device Info", "deviceInfo", Icon.Pencil],
    ["Update Controls", "controls", Icon.List],
    ["Put Comfort Options", "comfortOptions", Icon.Window],
    ["Update Webasto Settings", "webastoSettings", Icon.Gear],
    ["Update Remote Start Settings", "remoteStartSettings", Icon.Gear],
    ["Update Shock Sensor Settings", "shockSensorSettings", Icon.Gear],
    ["Update Monitoring Settings", "monitoringSettings", Icon.Gear],
] as const satisfies ReadonlyArray<readonly [string, DeviceJsonMutationKind, Icon]>;

const destructiveConfirmation = (
    title: string,
    message: string,
    primaryActionTitle: string,
): RawCommand["confirmation"] => ({
    title,
    message,
    primaryActionTitle,
    style: Alert.ActionStyle.Destructive,
});

const toggleCommands = (
    command: string,
    icon: Icon,
    enabled: Pick<RawCommand, "title" | "successMessage">,
    disabled: Pick<RawCommand, "title" | "successMessage">,
    disabledIcon = icon,
): RawCommand[] => [
    { ...enabled, command, value: 1, icon },
    { ...disabled, command, value: 0, icon: disabledIcon },
];

const QUICK_COMMANDS = toggleCommands(
    RAW_COMMAND_TYPES.handsFree,
    Icon.Person,
    { title: "Enable Hands Free", successMessage: "Hands Free enabled" },
    { title: "Disable Hands Free", successMessage: "Hands Free disabled" },
);

const ADVANCED_COMMANDS: RawCommand[] = [
    {
        title: "Disarm Trunk",
        command: RAW_COMMAND_TYPES.disarmTrunk,
        icon: Icon.LockUnlocked,
        successMessage: "Trunk disarmed",
        confirmation: destructiveConfirmation(
            "Disarm trunk?",
            "This will disable trunk security for the selected device.",
            "Disarm Trunk",
        ),
    },
    {
        title: "Panic",
        command: RAW_COMMAND_TYPES.panic,
        icon: Icon.ExclamationMark,
        confirmation: destructiveConfirmation(
            "Trigger panic mode?",
            "This will enable alarm mode for 15 seconds.",
            "Trigger Panic",
        ),
    },
    {
        title: "Get SIM 1 Balance",
        command: RAW_COMMAND_TYPES.balance,
        value: 1,
        icon: Icon.CreditCard,
    },
    {
        title: "Get SIM 2 Balance",
        command: RAW_COMMAND_TYPES.balance,
        value: 2,
        icon: Icon.CreditCard,
    },
    ...toggleCommands(
        RAW_COMMAND_TYPES.output,
        Icon.Bolt,
        { title: "Enable Output", successMessage: "Enable Output" },
        { title: "Disable Output", successMessage: "Disable Output" },
        Icon.BoltDisabled,
    ),
    ...toggleCommands(
        RAW_COMMAND_TYPES.dvr,
        Icon.Video,
        { title: "Enable DVR", successMessage: "Enable DVR" },
        { title: "Disable DVR", successMessage: "Disable DVR" },
    ),
    ...toggleCommands(
        RAW_COMMAND_TYPES.webasto,
        Icon.Gear,
        { title: "Enable Webasto", successMessage: "Enable Webasto" },
        { title: "Disable Webasto", successMessage: "Disable Webasto" },
    ),
    { title: "Webasto On", command: RAW_COMMAND_TYPES.webastoOn, icon: Icon.Gear },
    { title: "Webasto Off", command: RAW_COMMAND_TYPES.webastoOff, icon: Icon.Gear },
    ...Array.from({ length: 9 }, (_, index) => ({
        title: `Flex ${index + 1}`,
        command: RAW_COMMAND_TYPES.flex(index + 1),
        icon: Icon.CommandSymbol,
    })),
];

const panelItem = <TKind extends string>([title, kind, icon]: readonly [string, TKind, Icon]) => ({
    title,
    kind,
    icon,
});

const DEVICE_DETAIL_ACTIONS = DETAIL_ITEMS.map(panelItem);
const JSON_FORM_ACTIONS = JSON_FORM_ITEMS.map(panelItem);

function DetailActions({ items }: { items: Array<PanelItem<DeviceApiDetailKind>> }) {
    const item = useSelectedDeviceItem();

    return items.map(({ title, kind, icon }) => (
        <Action.Push
            key={kind}
            title={`Show ${title}`}
            icon={icon}
            target={<DeviceApiDetail item={item} kind={kind} title={title} />}
        />
    ));
}

function JsonFormActions({ items }: { items: Array<PanelItem<DeviceJsonMutationKind>> }) {
    const item = useSelectedDeviceItem();
    const deviceInfoBody = { alias: item.alias, phone: item.phone };

    return items.map(({ title, kind, icon }) => (
        <Action.Push
            key={kind}
            title={title}
            icon={icon}
            target={
                <DeviceJsonMutationForm
                    item={item}
                    kind={kind}
                    title={title}
                    defaultBody={kind === "deviceInfo" ? deviceInfoBody : undefined}
                />
            }
        />
    ));
}

function DevicesItemActionPanel({ showDetailsAction = true }: { showDetailsAction?: boolean }) {
    const item = useSelectedDeviceItem();

    return (
        <ActionPanel>
            <ActionPanel.Section>
                {showDetailsAction && (
                    <Action.Push title="Show Details" target={<DeviceDetails item={item} />} />
                )}
                {PRIMARY_DEVICE_ACTIONS.map((command) => (
                    <ConfiguredDeviceCommandAction key={command} command={command} />
                ))}
                {QUICK_COMMANDS.map((command) => (
                    <CommandAction key={command.title} {...command} />
                ))}
                <DefaultDeviceAction isDefault={item.default} />
            </ActionPanel.Section>

            <ActionPanel.Section title="Device Data">
                <DetailActions items={DEVICE_DETAIL_ACTIONS} />
            </ActionPanel.Section>

            {environment.isDevelopment && (
                <ActionPanel.Section title="Settings / Advanced JSON Forms">
                    <JsonFormActions items={JSON_FORM_ACTIONS} />
                </ActionPanel.Section>
            )}

            <ActionPanel.Section title="Advanced Commands">
                {ADVANCED_COMMANDS.map((command) => (
                    <CommandAction key={command.title} {...command} />
                ))}
            </ActionPanel.Section>

            {environment.isDevelopment && (
                <ActionPanel.Section title="Development">
                    <Action.CopyToClipboard
                        title="Copy Item UUID"
                        content={item.device_id.toString()}
                    />
                    <ClearAuthCacheAction />
                </ActionPanel.Section>
            )}
        </ActionPanel>
    );
}

export default DevicesItemActionPanel;
