import React from "react";
import { Action, ActionPanel, environment } from "@raycast/api";

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

function DevicesItemActionPanel() {
    const { device_id: deviceId } = useSelectedDeviceItem();

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
                <SetAsDefaultDeviceAction />
                <UnsetAsDefaultDeviceAction />
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
