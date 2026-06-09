import {
    Action,
    ActionPanel,
    Alert,
    Form,
    Toast,
    confirmAlert,
    popToRoot,
    showToast,
} from "@raycast/api";
import React, { useState } from "react";

import { useStarLine } from "../context/starline";

import type { Item } from "../types/devices";

type DeviceJsonMutationKind =
    | "deviceInfo"
    | "controls"
    | "comfortOptions"
    | "webastoSettings"
    | "remoteStartSettings"
    | "shockSensorSettings"
    | "monitoringSettings";

type DeviceJsonMutationFormProps = {
    item: Item;
    kind: DeviceJsonMutationKind;
    title: string;
    defaultBody?: unknown;
};

function defaultJson(value: unknown) {
    return JSON.stringify(value === undefined ? {} : value, null, 4);
}

function DeviceJsonMutationForm(props: DeviceJsonMutationFormProps) {
    const { item, kind, title, defaultBody = {} } = props;
    const starline = useStarLine();
    const [body, setBody] = useState(defaultJson(defaultBody));

    const submit = async () => {
        let parsedBody: unknown;

        try {
            parsedBody = JSON.parse(body);
        } catch (error) {
            await showToast(Toast.Style.Failure, "Invalid JSON", "Please check request body");
            return;
        }

        const confirmed = await confirmAlert({
            title: `${title}?`,
            message:
                "This will change StarLine device settings. Continue only if you know the expected JSON schema.",
            primaryAction: {
                title: "Submit",
                style: Alert.ActionStyle.Destructive,
            },
        });

        if (!confirmed) {
            return;
        }

        const toast = await showToast(Toast.Style.Animated, title);
        const deviceId = item.device_id.toString();

        try {
            switch (kind) {
                case "deviceInfo":
                    await starline.updateDeviceInfo(deviceId, parsedBody);
                    break;
                case "controls":
                    await starline.updateControls(deviceId, parsedBody);
                    break;
                case "comfortOptions":
                    await starline.putComfortOptions(deviceId, parsedBody);
                    break;
                case "webastoSettings":
                    await starline.updateWebastoSettings(deviceId, parsedBody);
                    break;
                case "remoteStartSettings":
                    await starline.updateRemoteStartSettings(deviceId, parsedBody);
                    break;
                case "shockSensorSettings":
                    await starline.updateShockSensorSettings(deviceId, parsedBody);
                    break;
                case "monitoringSettings":
                    await starline.updateMonitoringSettings(deviceId, parsedBody);
                    break;
                default:
                    break;
            }

            toast.style = Toast.Style.Success;
            toast.title = "Saved";
            await popToRoot();
        } catch (error) {
            toast.style = Toast.Style.Failure;
            toast.title = "Failed to save";
            toast.message = error instanceof Error ? error.message : "Unknown error";
        }
    };

    return (
        <Form
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Submit JSON" onSubmit={submit} />
                </ActionPanel>
            }
        >
            <Form.Description
                title={title}
                text="Advanced operation. Edit JSON body according to StarLine API documentation."
            />
            <Form.TextArea id="body" title="Request Body" value={body} onChange={setBody} />
        </Form>
    );
}

export default DeviceJsonMutationForm;
