import React, { useEffect, useState } from "react";
import { Detail, Toast, showToast } from "@raycast/api";
import { Item } from "../types/devices";
import { useStarLine } from "../context/starline";
import DevicesItemActionPanel from "./DeviceItemPanel";
import DevicesItemContext from "./context/deviceItem";

type DeviceApiDetailKind =
    | "controls"
    | "info"
    | "position"
    | "state"
    | "obdParams"
    | "obdErrors"
    | "data"
    | "report"
    | "settings"
    | "comfortOptions"
    | "events"
    | "ways"
    | "drivingScore"
    | "drivingScoreHistory";

type DeviceApiDetailProps = {
    item: Item;
    kind: DeviceApiDetailKind;
    title: string;
};

function formatJson(value: unknown) {
    return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

function lastHoursPeriod(hours: number) {
    const periodEnd = Math.floor(Date.now() / 1000);
    const periodStart = periodEnd - hours * 60 * 60;

    return { periodStart, periodEnd };
}

function DeviceApiDetail(props: DeviceApiDetailProps) {
    const { item, kind, title } = props;
    const starline = useStarLine();
    const [isLoading, setIsLoading] = useState(true);
    const [markdown, setMarkdown] = useState(`# ${title}\n\nLoading...`);

    useEffect(() => {
        async function load() {
            try {
                setIsLoading(true);
                const deviceId = item.device_id.toString();
                let data: unknown;
                const { periodStart, periodEnd } = lastHoursPeriod(24);

                switch (kind) {
                    case "controls":
                        data = await starline.getControlsLibrary(deviceId);
                        break;
                    case "info":
                        data = await starline.getDeviceInfo(deviceId);
                        break;
                    case "position":
                        data = await starline.getPosition(deviceId);
                        break;
                    case "state":
                        data = await starline.getState(deviceId);
                        break;
                    case "obdParams":
                        data = await starline.getObdParams(deviceId);
                        break;
                    case "obdErrors":
                        data = await starline.getObdErrors(deviceId);
                        break;
                    case "data":
                        data = await starline.getDeviceData(deviceId);
                        break;
                    case "report":
                        data = await starline.getDeviceReport(deviceId);
                        break;
                    case "settings":
                        data = await starline.getSettings(deviceId);
                        break;
                    case "comfortOptions":
                        data = await starline.getSupportedComfortOptions(deviceId);
                        break;
                    case "events":
                        data = await starline.getEvents(deviceId, {
                            period_start: periodStart,
                            period_end: periodEnd,
                        });
                        break;
                    case "ways":
                        data = await starline.getWays(deviceId, {
                            begin: periodStart,
                            end: periodEnd,
                            split_way: false,
                        });
                        break;
                    case "drivingScore":
                        data = await starline.getDrivingScore(deviceId, {});
                        break;
                    case "drivingScoreHistory":
                        data = await starline.getDrivingScoreHistory(deviceId, {});
                        break;
                    default:
                        data = null;
                }

                setMarkdown(`# ${title}\n\n${formatJson(data)}`);
            } catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                setMarkdown(`# ${title}\n\nFailed to load data.\n\n${message}`);
                await showToast(Toast.Style.Failure, `Failed to load ${title}`, message);
            } finally {
                setIsLoading(false);
            }
        }

        void load();
    }, [item.device_id, kind, starline, title]);

    return (
        <DevicesItemContext.Provider value={item}>
            <Detail
                isLoading={isLoading}
                markdown={markdown}
                actions={<DevicesItemActionPanel showDetailsAction={false} />}
            />
        </DevicesItemContext.Provider>
    );
}

export default DeviceApiDetail;
