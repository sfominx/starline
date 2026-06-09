import { Action, ActionPanel, Alert, Icon, environment } from "@raycast/api";

import AdditionalSensorBypassAction from "./actions/AdditionalSensorBypass";
import ArmAction from "./actions/Arm";
import ArmQuietlyAction from "./actions/ArmQuietly";
import ClearAuthCacheAction from "./actions/ClearAuthCache";
import CommandAction from "./actions/Command";
import DisarmAction from "./actions/Disarm";
import DisarmQuietlyAction from "./actions/DisarmQuietly";
import ServiceModeDisableAction from "./actions/ServiceModeDisable";
import ServiceModeEnableAction from "./actions/ServiceModeEnable";
import SetAsDefaultDeviceAction from "./actions/SetAsDefaultDevice";
import ShockSensorBypassAction from "./actions/ShockSensorBypass";
import StartEngineAction from "./actions/StartEngine";
import StopEngineAction from "./actions/StopEngine";
import TiltSensorBypassAction from "./actions/TiltSensorBypass";
import UnsetAsDefaultDeviceAction from "./actions/UnsetAsDefaultDevice";
import { useSelectedDeviceItem } from "./context/deviceItem";
import DeviceApiDetail from "./DeviceApiDetail";
import DeviceDetails from "./DeviceDetails";
import DeviceJsonMutationForm from "./DeviceJsonMutationForm";

import type { DeviceApiDetailKind } from "./DeviceApiDetail";
import type { DeviceJsonMutationKind } from "./DeviceJsonMutationForm";

type CommandConfig = {
    title: string;
    command: string;
    icon?: Icon;
    value?: string | number | boolean;
    successMessage?: string;
    confirmation?: {
        title: string;
        message?: string;
        primaryActionTitle?: string;
        style?: Alert.ActionStyle;
    };
};

type DetailConfig = {
    title: string;
    kind: DeviceApiDetailKind;
    icon: Icon;
};

type MutationConfig = {
    title: string;
    kind: DeviceJsonMutationKind;
    icon: Icon;
    defaultBody?: unknown;
};

const DEVICE_DETAILS: DetailConfig[] = [
    { title: "Supported Controls", kind: "controls", icon: Icon.List },
    { title: "Live State", kind: "state", icon: Icon.Heartbeat },
    { title: "Position", kind: "position", icon: Icon.Map },
    { title: "Device Info", kind: "info", icon: Icon.Info },
    { title: "Full Device Data", kind: "data", icon: Icon.Document },
    { title: "Summary Report", kind: "report", icon: Icon.BarChart },
    { title: "Settings", kind: "settings", icon: Icon.Gear },
    { title: "Comfort Options", kind: "comfortOptions", icon: Icon.Window },
    { title: "Events / Last 24h", kind: "events", icon: Icon.Clock },
    { title: "Track / Last 24h", kind: "ways", icon: Icon.Map },
    { title: "Driving Score", kind: "drivingScore", icon: Icon.BarChart },
    { title: "Driving Score History", kind: "drivingScoreHistory", icon: Icon.BarChart },
    { title: "OBD Params", kind: "obdParams", icon: Icon.Gauge },
    { title: "OBD Errors", kind: "obdErrors", icon: Icon.ExclamationMark },
];

const JSON_FORMS: MutationConfig[] = [
    { title: "Update Device Info", kind: "deviceInfo", icon: Icon.Pencil },
    { title: "Update Controls", kind: "controls", icon: Icon.List },
    { title: "Put Comfort Options", kind: "comfortOptions", icon: Icon.Window },
    { title: "Update Webasto Settings", kind: "webastoSettings", icon: Icon.Gear },
    { title: "Update Remote Start Settings", kind: "remoteStartSettings", icon: Icon.Gear },
    { title: "Update Shock Sensor Settings", kind: "shockSensorSettings", icon: Icon.Gear },
    { title: "Update Monitoring Settings", kind: "monitoringSettings", icon: Icon.Gear },
];

const QUICK_COMMANDS: CommandConfig[] = [
    {
        title: "Enable Hands Free",
        command: "hfree",
        value: 1,
        icon: Icon.Person,
        successMessage: "Hands Free enabled",
    },
    {
        title: "Disable Hands Free",
        command: "hfree",
        value: 0,
        icon: Icon.Person,
        successMessage: "Hands Free disabled",
    },
    { title: "Horn", command: "poke", icon: Icon.SpeakerUp, successMessage: "Horn" },
    {
        title: "Update Position",
        command: "update_position",
        icon: Icon.Map,
        successMessage: "Position update requested",
    },
];

const ADVANCED_COMMANDS: CommandConfig[] = [
    {
        title: "Disarm Trunk",
        command: "disarm_trunk",
        icon: Icon.LockUnlocked,
        successMessage: "Trunk disarmed",
        confirmation: {
            title: "Disarm trunk?",
            message: "This will disable trunk security for the selected device.",
            primaryActionTitle: "Disarm Trunk",
            style: Alert.ActionStyle.Destructive,
        },
    },
    {
        title: "Panic",
        command: "panic",
        icon: Icon.ExclamationMark,
        confirmation: {
            title: "Trigger panic mode?",
            message: "This will enable alarm mode for 15 seconds.",
            primaryActionTitle: "Trigger Panic",
            style: Alert.ActionStyle.Destructive,
        },
    },
    { title: "Get SIM 1 Balance", command: "getbalance", value: 1, icon: Icon.CreditCard },
    { title: "Get SIM 2 Balance", command: "getbalance", value: 2, icon: Icon.CreditCard },
    { title: "Enable Output", command: "out", value: 1, icon: Icon.Bolt },
    { title: "Disable Output", command: "out", value: 0, icon: Icon.BoltDisabled },
    { title: "Enable DVR", command: "dvr", value: 1, icon: Icon.Video },
    { title: "Disable DVR", command: "dvr", value: 0, icon: Icon.Video },
    { title: "Enable Webasto", command: "webasto", value: 1, icon: Icon.Gear },
    { title: "Disable Webasto", command: "webasto", value: 0, icon: Icon.Gear },
    { title: "Webasto On", command: "webasto_on", icon: Icon.Gear },
    { title: "Webasto Off", command: "webasto_off", icon: Icon.Gear },
    ...Array.from({ length: 9 }, (_, index) => ({
        title: `Flex ${index + 1}`,
        command: `flex_${index + 1}`,
        icon: Icon.CommandSymbol,
    })),
];

function renderCommand(config: CommandConfig) {
    return <CommandAction key={config.title} {...config} />;
}

function DevicesItemActionPanel({ showDetailsAction = true }: { showDetailsAction?: boolean }) {
    const item = useSelectedDeviceItem();
    const { device_id: deviceId, default: isDefault } = item;
    const jsonForms = JSON_FORMS.map((form) =>
        form.kind === "deviceInfo"
            ? { ...form, defaultBody: { alias: item.alias, phone: item.phone } }
            : form,
    );

    return (
        <ActionPanel>
            <ActionPanel.Section>
                {showDetailsAction && (
                    <Action.Push title="Show Details" target={<DeviceDetails item={item} />} />
                )}
                <ArmAction />
                <StartEngineAction />
                <DisarmAction />
                <StopEngineAction />
                <ArmQuietlyAction />
                <DisarmQuietlyAction />
                <ShockSensorBypassAction />
                <TiltSensorBypassAction />
                <AdditionalSensorBypassAction />
                <ServiceModeEnableAction />
                <ServiceModeDisableAction />
                {QUICK_COMMANDS.map(renderCommand)}
                {isDefault ? <UnsetAsDefaultDeviceAction /> : <SetAsDefaultDeviceAction />}
            </ActionPanel.Section>

            <ActionPanel.Section title="Device Data">
                {DEVICE_DETAILS.map(({ title, kind, icon }) => (
                    <Action.Push
                        key={kind}
                        title={`Show ${title}`}
                        icon={icon}
                        target={<DeviceApiDetail item={item} kind={kind} title={title} />}
                    />
                ))}
            </ActionPanel.Section>

            <ActionPanel.Section title="Settings / Advanced JSON Forms">
                {jsonForms.map(({ title, kind, icon, defaultBody }) => (
                    <Action.Push
                        key={kind}
                        title={title}
                        icon={icon}
                        target={
                            <DeviceJsonMutationForm
                                item={item}
                                kind={kind}
                                title={title}
                                defaultBody={defaultBody}
                            />
                        }
                    />
                ))}
            </ActionPanel.Section>

            <ActionPanel.Section title="Advanced Commands">
                {ADVANCED_COMMANDS.map(renderCommand)}
            </ActionPanel.Section>

            {environment.isDevelopment && (
                <ActionPanel.Section title="Development">
                    <Action.CopyToClipboard title="Copy Item UUID" content={deviceId} />
                    <ClearAuthCacheAction />
                </ActionPanel.Section>
            )}
        </ActionPanel>
    );
}

export default DevicesItemActionPanel;
