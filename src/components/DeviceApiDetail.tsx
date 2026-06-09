import { Detail, Toast, showToast } from "@raycast/api";
import { useEffect, useState } from "react";

import { useStarLine } from "../context/starline";
import { enabledDisabledLabel, statusLabel } from "../utils/format";

import type { StarLine } from "../starline/api";
import type { Item } from "../types/devices";
import type {
    ControlsLibraryResponse,
    DeviceEventsResponse,
    DevicePositionResponse,
    DeviceSettingsResponse,
    DeviceStateResponse,
    ObdErrorsResponse,
    ObdParamsResponse,
} from "../types/starline";

export type DeviceApiDetailKind =
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

const DEFAULT_HISTORY_HOURS = 24;

function formatJson(value: unknown) {
    return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

function formatUnixTimestamp(value?: number | string) {
    if (value === undefined) {
        return "—";
    }
    const timestamp = typeof value === "string" ? Number(value) : value;
    if (Number.isNaN(timestamp)) {
        return value.toString();
    }
    return new Date(timestamp * 1000).toLocaleString();
}

function formatControls(data: ControlsLibraryResponse) {
    const controls = Object.entries(data.controls)
        .map(([command, control]) => `| \`${command}\` | ${control.title ?? "—"} |`)
        .join("\n");

    return `| Command | Title |\n| --- | --- |\n${controls.length > 0 ? controls : "| — | — |"}`;
}

function formatState(data: DeviceStateResponse) {
    const { state } = data;

    return `## Security\n\n| Field | Value |\n| --- | --- |\n| Armed | ${statusLabel(state.car_state.arm, "В охране", "Снято с охраны")} |\n| Alarm | ${statusLabel(state.car_state.alarm, "Тревога", "Нет тревоги")} |\n| Service Mode | ${enabledDisabledLabel(state.car_state.valet)} |\n| Hijack | ${enabledDisabledLabel(state.car_state.hijack)} |\n\n## Engine\n\n| Field | Value |\n| --- | --- |\n| Running | ${statusLabel(state.car_state.run, "Запущен", "Остановлен")} |\n| Ignition | ${enabledDisabledLabel(state.car_state.ign)} |\n| Remote Start | ${enabledDisabledLabel(state.car_state.r_start)} |\n| Webasto | ${enabledDisabledLabel(state.car_state.webasto)} |\n\n## Telemetry\n\n| Field | Value |\n| --- | --- |\n| Battery | ${state.battery ?? "—"} |\n| Cabin Temp | ${state.ctemp ?? "—"}°C |\n| Engine Temp | ${state.etemp ?? "—"}°C |\n| GPS Level | ${state.gps_lvl ?? "—"} |\n| GSM Level | ${state.gsm_lvl ?? "—"} |\n| Last Activity | ${formatUnixTimestamp(state.ts_activity)} |\n\n## Position\n\n| Field | Value |\n| --- | --- |\n| X / Lat | ${state.position?.x ?? "—"} |\n| Y / Lon | ${state.position?.y ?? "—"} |\n| Timestamp | ${formatUnixTimestamp(state.position?.ts)} |`;
}

function formatPosition(data: DevicePositionResponse) {
    const position = data.device.position;

    return `| Field | Value |\n| --- | --- |\n| Latitude | ${position.lat ?? "—"} |\n| Longitude | ${position.lon ?? "—"} |\n| Precision | ${position.pres ?? "—"} m |\n| Timestamp | ${position.ts ?? "—"} |`;
}

function formatEvents(data: DeviceEventsResponse) {
    const events = data.events
        .map(
            (event) =>
                `| ${formatUnixTimestamp(event.timestamp)} | ${event.groupId} | ${event.type} |`,
        )
        .join("\n");

    return `| Time | Group | Type |\n| --- | --- | --- |\n${events.length > 0 ? events : "| — | — | — |"}`;
}

function formatObdParams(data: ObdParamsResponse) {
    const params = data.obd_params;

    return `| Field | Value | Timestamp |\n| --- | --- | --- |\n| Fuel | ${params?.fuel?.val ?? "—"} ${params?.fuel?.type ?? ""} | ${formatUnixTimestamp(params?.fuel?.ts)} |\n| Errors | ${params?.errors?.val ?? "—"} | ${formatUnixTimestamp(params?.errors?.ts)} |\n| Mileage | ${params?.mileage?.val ?? "—"} km | ${formatUnixTimestamp(params?.mileage?.ts)} |\n\nMinimum firmware: ${data.requirements?.min_version ?? "—"}`;
}

function formatObdErrors(data: ObdErrorsResponse) {
    const errors = data.obd_errors
        .map(
            (error) =>
                `| ${error.error ?? "—"} | ${formatUnixTimestamp(error.error_ts)} | ${error.warning_level ?? "—"} | ${error.descriptions?.en ?? error.descriptions?.ru ?? "—"} |`,
        )
        .join("\n");

    return `| Error | Time | Warning | Description |\n| --- | --- | --- | --- |\n${errors.length > 0 ? errors : "| No errors | — | — | — |"}`;
}

function formatSettings(data: DeviceSettingsResponse) {
    return `## General\n\n| Field | Value |\n| --- | --- |\n| Device ID | ${data.device_id} |\n| Name | ${data.general?.name ?? "—"} |\n| Phone | ${data.general?.tel ?? "—"} |\n| IMEI | ${data.general?.imei ?? "—"} |\n| Firmware | ${data.general?.fw_version ?? "—"} |\n\n## Raw Setting Sections\n\n${formatJson(
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
        case "info":
        case "data":
        case "report":
        case "comfortOptions":
        case "ways":
        case "drivingScore":
        case "drivingScoreHistory":
            return formatJson(data);
    }
}

function lastHoursPeriod(hours: number) {
    const periodEnd = Math.floor(Date.now() / 1000);
    const periodStart = periodEnd - hours * 60 * 60;

    return { periodStart, periodEnd };
}

type ApiDetailLoader = (
    starline: StarLine,
    deviceId: string,
    period: ReturnType<typeof lastHoursPeriod>,
) => Promise<unknown>;

const API_DETAIL_LOADERS: Record<DeviceApiDetailKind, ApiDetailLoader> = {
    controls: (starline, deviceId) => starline.getControlsLibrary(deviceId),
    info: (starline, deviceId) => starline.getDeviceInfo(deviceId),
    position: (starline, deviceId) => starline.getPosition(deviceId),
    state: (starline, deviceId) => starline.getState(deviceId),
    obdParams: (starline, deviceId) => starline.getObdParams(deviceId),
    obdErrors: (starline, deviceId) => starline.getObdErrors(deviceId),
    data: (starline, deviceId) => starline.getDeviceData(deviceId),
    report: (starline, deviceId) => starline.getDeviceReport(deviceId),
    settings: (starline, deviceId) => starline.getSettings(deviceId),
    comfortOptions: (starline, deviceId) => starline.getSupportedComfortOptions(deviceId),
    events: (starline, deviceId, { periodStart, periodEnd }) =>
        starline.getEvents(deviceId, { period_start: periodStart, period_end: periodEnd }),
    ways: (starline, deviceId, { periodStart, periodEnd }) =>
        starline.getWays(deviceId, { begin: periodStart, end: periodEnd, split_way: false }),
    drivingScore: (starline, deviceId) => starline.getDrivingScore(deviceId, {}),
    drivingScoreHistory: (starline, deviceId) => starline.getDrivingScoreHistory(deviceId, {}),
};

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
                const data = await API_DETAIL_LOADERS[kind](
                    starline,
                    deviceId,
                    lastHoursPeriod(DEFAULT_HISTORY_HOURS),
                );

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

    return <Detail isLoading={isLoading} markdown={markdown} />;
}

export default DeviceApiDetail;
