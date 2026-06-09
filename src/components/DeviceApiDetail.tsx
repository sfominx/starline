import React, { useEffect, useState } from "react";
import { Detail, Toast, showToast } from "@raycast/api";
import { Item } from "../types/devices";
import { useStarLine } from "../context/starline";
import DevicesItemActionPanel from "./DeviceItemPanel";
import DevicesItemContext from "./context/deviceItem";
import {
    ControlsLibraryResponse,
    DeviceEventsResponse,
    DevicePositionResponse,
    DeviceSettingsResponse,
    DeviceStateResponse,
    ObdErrorsResponse,
    ObdParamsResponse,
} from "../types/starline";

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

function formatUnixTimestamp(value?: number | string) {
    if (value === undefined) return "—";
    const timestamp = typeof value === "string" ? Number(value) : value;
    if (Number.isNaN(timestamp)) return value.toString();
    return new Date(timestamp * 1000).toLocaleString();
}

function boolLabel(value: unknown) {
    if (value === undefined) return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
}

function formatControls(data: ControlsLibraryResponse) {
    const controls = Object.entries(data.controls || {})
        .map(([command, control]) => `| \`${command}\` | ${control.title || "—"} |`)
        .join("\n");

    return `| Command | Title |\n| --- | --- |\n${controls || "| — | — |"}`;
}

function formatState(data: DeviceStateResponse) {
    const { state } = data;

    return `## Security\n\n| Field | Value |\n| --- | --- |\n| Armed | ${boolLabel(state.car_state?.arm)} |\n| Alarm | ${boolLabel(state.car_state?.alarm)} |\n| Service Mode | ${boolLabel(state.car_state?.valet)} |\n| Hijack | ${boolLabel(state.car_state?.hijack)} |\n\n## Engine\n\n| Field | Value |\n| --- | --- |\n| Running | ${boolLabel(state.car_state?.run)} |\n| Ignition | ${boolLabel(state.car_state?.ign)} |\n| Remote Start | ${boolLabel(state.car_state?.r_start)} |\n| Webasto | ${boolLabel(state.car_state?.webasto)} |\n\n## Telemetry\n\n| Field | Value |\n| --- | --- |\n| Battery | ${state.battery ?? "—"} |\n| Cabin Temp | ${state.ctemp ?? "—"}°C |\n| Engine Temp | ${state.etemp ?? "—"}°C |\n| GPS Level | ${state.gps_lvl ?? "—"} |\n| GSM Level | ${state.gsm_lvl ?? "—"} |\n| Last Activity | ${formatUnixTimestamp(state.ts_activity)} |\n\n## Position\n\n| Field | Value |\n| --- | --- |\n| X / Lat | ${state.position?.x ?? "—"} |\n| Y / Lon | ${state.position?.y ?? "—"} |\n| Timestamp | ${formatUnixTimestamp(state.position?.ts)} |`;
}

function formatPosition(data: DevicePositionResponse) {
    const position = data.device.position;

    return `| Field | Value |\n| --- | --- |\n| Latitude | ${position.lat || "—"} |\n| Longitude | ${position.lon || "—"} |\n| Precision | ${position.pres || "—"} m |\n| Timestamp | ${position.ts || "—"} |`;
}

function formatEvents(data: DeviceEventsResponse) {
    const events = data.events
        .map(
            (event) =>
                `| ${formatUnixTimestamp(event.timestamp)} | ${event.groupId} | ${event.type} |`,
        )
        .join("\n");

    return `| Time | Group | Type |\n| --- | --- | --- |\n${events || "| — | — | — |"}`;
}

function formatObdParams(data: ObdParamsResponse) {
    const params = data.obd_params;

    return `| Field | Value | Timestamp |\n| --- | --- | --- |\n| Fuel | ${params?.fuel?.val ?? "—"} ${params?.fuel?.type || ""} | ${formatUnixTimestamp(params?.fuel?.ts)} |\n| Errors | ${params?.errors?.val ?? "—"} | ${formatUnixTimestamp(params?.errors?.ts)} |\n| Mileage | ${params?.mileage?.val ?? "—"} km | ${formatUnixTimestamp(params?.mileage?.ts)} |\n\nMinimum firmware: ${data.requirements?.min_version || "—"}`;
}

function formatObdErrors(data: ObdErrorsResponse) {
    const errors = data.obd_errors
        .map(
            (error) =>
                `| ${error.error || "—"} | ${formatUnixTimestamp(error.error_ts)} | ${error.warning_level ?? "—"} | ${error.descriptions?.en || error.descriptions?.ru || "—"} |`,
        )
        .join("\n");

    return `| Error | Time | Warning | Description |\n| --- | --- | --- | --- |\n${errors || "| No errors | — | — | — |"}`;
}

function formatSettings(data: DeviceSettingsResponse) {
    return `## General\n\n| Field | Value |\n| --- | --- |\n| Device ID | ${data.device_id} |\n| Name | ${data.general?.name || "—"} |\n| Phone | ${data.general?.tel || "—"} |\n| IMEI | ${data.general?.imei || "—"} |\n| Firmware | ${data.general?.fw_version || "—"} |\n\n## Raw Setting Sections\n\n${formatJson(
        {
            webasto: data.webasto,
            monitoring: data.monitoring,
            shock_sens: data.shock_sens,
            remote_start: data.remote_start,
        },
    )}`;
}

function formatTypedData(kind: DeviceApiDetailKind, data: unknown) {
    switch (kind) {
        case "controls":
            return formatControls(data as ControlsLibraryResponse);
        case "state":
            return formatState(data as DeviceStateResponse);
        case "position":
            return formatPosition(data as DevicePositionResponse);
        case "events":
            return formatEvents(data as DeviceEventsResponse);
        case "obdParams":
            return formatObdParams(data as ObdParamsResponse);
        case "obdErrors":
            return formatObdErrors(data as ObdErrorsResponse);
        case "settings":
            return formatSettings(data as DeviceSettingsResponse);
        default:
            return formatJson(data);
    }
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

                setMarkdown(`# ${title}\n\n${formatTypedData(kind, data)}`);
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
