import React from "react";
import { Action, ActionPanel, Alert, Icon, environment } from "@raycast/api";

import StartEngineAction from "./actions/StartEngine";
import { useSelectedDeviceItem } from "./context/deviceItem";
import StopEngineAction from "./actions/StopEngine";
import DisarmAction from "./actions/Disarm";
import ArmAction from "./actions/Arm";
import ArmQuietlyAction from "./actions/ArmQuietly";
import DisarmQuietlyAction from "./actions/DisarmQuietly";
import ShockSensorBypassAction from "./actions/ShockSensorBypass";
import TiltSensorBypassAction from "./actions/TiltSensorBypass";
import AdditionalSensorBypassAction from "./actions/AdditionalSensorBypass";
import ServiceModeEnableAction from "./actions/ServiceModeEnable";
import ServiceModeDisableAction from "./actions/ServiceModeDisable";
import SetAsDefaultDeviceAction from "./actions/SetAsDefaultDevice";
import UnsetAsDefaultDeviceAction from "./actions/UnsetAsDefaultDevice";
import CommandAction from "./actions/Command";
import DeviceApiDetail from "./DeviceApiDetail";
import DeviceDetails from "./DeviceDetails";
import DeviceJsonMutationForm from "./DeviceJsonMutationForm";

function DevicesItemActionPanel({ showDetailsAction = true }: { showDetailsAction?: boolean }) {
    const selectedItem = useSelectedDeviceItem();
    const { device_id: deviceId, default: isDefault } = selectedItem;

    return (
        <ActionPanel>
            <ActionPanel.Section>
                {showDetailsAction && (
                    <Action.Push
                        title="Show Details"
                        target={<DeviceDetails item={selectedItem} />}
                    />
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
                <CommandAction
                    title="Enable Hands Free"
                    command="hfree"
                    value={1}
                    icon={Icon.Person}
                    successMessage="Hands Free enabled"
                />
                <CommandAction
                    title="Disable Hands Free"
                    command="hfree"
                    value={0}
                    icon={Icon.Person}
                    successMessage="Hands Free disabled"
                />
                <CommandAction
                    title="Horn"
                    command="poke"
                    icon={Icon.SpeakerUp}
                    successMessage="Horn"
                />
                <CommandAction
                    title="Update Position"
                    command="update_position"
                    icon={Icon.Map}
                    successMessage="Position update requested"
                />
                {isDefault ? <UnsetAsDefaultDeviceAction /> : <SetAsDefaultDeviceAction />}
            </ActionPanel.Section>

            <ActionPanel.Section title="Device Data">
                <Action.Push
                    title="Show Supported Controls"
                    icon={Icon.List}
                    target={
                        <DeviceApiDetail
                            item={selectedItem}
                            kind="controls"
                            title="Supported Controls"
                        />
                    }
                />
                <Action.Push
                    title="Show Live State"
                    icon={Icon.Heartbeat}
                    target={<DeviceApiDetail item={selectedItem} kind="state" title="Live State" />}
                />
                <Action.Push
                    title="Show Position"
                    icon={Icon.Map}
                    target={
                        <DeviceApiDetail item={selectedItem} kind="position" title="Position" />
                    }
                />
                <Action.Push
                    title="Show Device Info"
                    icon={Icon.Info}
                    target={<DeviceApiDetail item={selectedItem} kind="info" title="Device Info" />}
                />
                <Action.Push
                    title="Show Full Data"
                    icon={Icon.Document}
                    target={
                        <DeviceApiDetail item={selectedItem} kind="data" title="Full Device Data" />
                    }
                />
                <Action.Push
                    title="Show Summary Report"
                    icon={Icon.BarChart}
                    target={
                        <DeviceApiDetail item={selectedItem} kind="report" title="Summary Report" />
                    }
                />
                <Action.Push
                    title="Show Settings"
                    icon={Icon.Gear}
                    target={
                        <DeviceApiDetail item={selectedItem} kind="settings" title="Settings" />
                    }
                />
                <Action.Push
                    title="Show Comfort Options"
                    icon={Icon.Window}
                    target={
                        <DeviceApiDetail
                            item={selectedItem}
                            kind="comfortOptions"
                            title="Comfort Options"
                        />
                    }
                />
                <Action.Push
                    title="Show Events"
                    icon={Icon.Clock}
                    target={
                        <DeviceApiDetail
                            item={selectedItem}
                            kind="events"
                            title="Events / Last 24h"
                        />
                    }
                />
                <Action.Push
                    title="Show Track"
                    icon={Icon.Map}
                    target={
                        <DeviceApiDetail item={selectedItem} kind="ways" title="Track / Last 24h" />
                    }
                />
                <Action.Push
                    title="Show Driving Score"
                    icon={Icon.BarChart}
                    target={
                        <DeviceApiDetail
                            item={selectedItem}
                            kind="drivingScore"
                            title="Driving Score"
                        />
                    }
                />
                <Action.Push
                    title="Show Driving Score History"
                    icon={Icon.BarChart}
                    target={
                        <DeviceApiDetail
                            item={selectedItem}
                            kind="drivingScoreHistory"
                            title="Driving Score History"
                        />
                    }
                />
                <Action.Push
                    title="Show OBD Params"
                    icon={Icon.Gauge}
                    target={
                        <DeviceApiDetail item={selectedItem} kind="obdParams" title="OBD Params" />
                    }
                />
                <Action.Push
                    title="Show OBD Errors"
                    icon={Icon.ExclamationMark}
                    target={
                        <DeviceApiDetail item={selectedItem} kind="obdErrors" title="OBD Errors" />
                    }
                />
            </ActionPanel.Section>

            <ActionPanel.Section title="Settings / Advanced JSON Forms">
                <Action.Push
                    title="Update Device Info"
                    icon={Icon.Pencil}
                    target={
                        <DeviceJsonMutationForm
                            item={selectedItem}
                            kind="deviceInfo"
                            title="Update Device Info"
                            defaultBody={{ alias: selectedItem.alias, phone: selectedItem.phone }}
                        />
                    }
                />
                <Action.Push
                    title="Update Controls"
                    icon={Icon.List}
                    target={
                        <DeviceJsonMutationForm
                            item={selectedItem}
                            kind="controls"
                            title="Update Controls"
                        />
                    }
                />
                <Action.Push
                    title="Put Comfort Options"
                    icon={Icon.Window}
                    target={
                        <DeviceJsonMutationForm
                            item={selectedItem}
                            kind="comfortOptions"
                            title="Put Comfort Options"
                        />
                    }
                />
                <Action.Push
                    title="Update Webasto Settings"
                    icon={Icon.Gear}
                    target={
                        <DeviceJsonMutationForm
                            item={selectedItem}
                            kind="webastoSettings"
                            title="Update Webasto Settings"
                        />
                    }
                />
                <Action.Push
                    title="Update Remote Start Settings"
                    icon={Icon.Gear}
                    target={
                        <DeviceJsonMutationForm
                            item={selectedItem}
                            kind="remoteStartSettings"
                            title="Update Remote Start Settings"
                        />
                    }
                />
                <Action.Push
                    title="Update Shock Sensor Settings"
                    icon={Icon.Gear}
                    target={
                        <DeviceJsonMutationForm
                            item={selectedItem}
                            kind="shockSensorSettings"
                            title="Update Shock Sensor Settings"
                        />
                    }
                />
                <Action.Push
                    title="Update Monitoring Settings"
                    icon={Icon.Gear}
                    target={
                        <DeviceJsonMutationForm
                            item={selectedItem}
                            kind="monitoringSettings"
                            title="Update Monitoring Settings"
                        />
                    }
                />
            </ActionPanel.Section>

            <ActionPanel.Section title="Advanced Commands">
                <CommandAction
                    title="Disarm Trunk"
                    command="disarm_trunk"
                    icon={Icon.LockUnlocked}
                    successMessage="Trunk disarmed"
                    confirmation={{
                        title: "Disarm trunk?",
                        message: "This will disable trunk security for the selected device.",
                        primaryActionTitle: "Disarm Trunk",
                        style: Alert.ActionStyle.Destructive,
                    }}
                />
                <CommandAction
                    title="Panic"
                    command="panic"
                    icon={Icon.ExclamationMark}
                    confirmation={{
                        title: "Trigger panic mode?",
                        message: "This will enable alarm mode for 15 seconds.",
                        primaryActionTitle: "Trigger Panic",
                        style: Alert.ActionStyle.Destructive,
                    }}
                />
                <CommandAction
                    title="Get SIM 1 Balance"
                    command="getbalance"
                    value={1}
                    icon={Icon.CreditCard}
                    successMessage="SIM 1 balance requested"
                />
                <CommandAction
                    title="Get SIM 2 Balance"
                    command="getbalance"
                    value={2}
                    icon={Icon.CreditCard}
                    successMessage="SIM 2 balance requested"
                />
                <CommandAction title="Enable Output" command="out" value={1} icon={Icon.Bolt} />
                <CommandAction
                    title="Disable Output"
                    command="out"
                    value={0}
                    icon={Icon.BoltDisabled}
                />
                <CommandAction title="Enable DVR" command="dvr" value={1} icon={Icon.Video} />
                <CommandAction title="Disable DVR" command="dvr" value={0} icon={Icon.Video} />
                <CommandAction
                    title="Enable Webasto"
                    command="webasto"
                    value={1}
                    icon={Icon.Gear}
                />
                <CommandAction
                    title="Disable Webasto"
                    command="webasto"
                    value={0}
                    icon={Icon.Gear}
                />
                <CommandAction title="Webasto On" command="webasto_on" icon={Icon.Gear} />
                <CommandAction title="Webasto Off" command="webasto_off" icon={Icon.Gear} />
                {Array.from({ length: 9 }, (_, index) => (
                    <CommandAction
                        key={index + 1}
                        title={`Flex ${index + 1}`}
                        command={`flex_${index + 1}`}
                        icon={Icon.CommandSymbol}
                    />
                ))}
            </ActionPanel.Section>

            {environment.isDevelopment && (
                <ActionPanel.Section title="Development">
                    <Action.CopyToClipboard title="Copy Item UUID" content={deviceId} />
                </ActionPanel.Section>
            )}
        </ActionPanel>
    );
}

export default DevicesItemActionPanel;
