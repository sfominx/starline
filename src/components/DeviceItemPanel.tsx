import React from "react";
import { Action, ActionPanel, Icon, environment } from "@raycast/api";

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

function DevicesItemActionPanel() {
    const { device_id: deviceId, default: isDefault } = useSelectedDeviceItem();

    return (
        <ActionPanel>
            <ActionPanel.Section>
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

            <ActionPanel.Section title="Advanced Commands">
                <CommandAction
                    title="Disarm Trunk"
                    command="disarm_trunk"
                    icon={Icon.LockUnlocked}
                    successMessage="Trunk disarmed"
                />
                <CommandAction title="Panic" command="panic" icon={Icon.ExclamationMark} />
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
