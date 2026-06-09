import { Detail } from "@raycast/api";
import React from "react";

import type { Item } from "../types/devices";

function boolLabel(value: boolean | undefined) {
    if (value === undefined) {
        return "—";
    }
    return value ? "Yes" : "No";
}

function displayString(value: string | undefined) {
    return value !== undefined && value.length > 0 ? value : "—";
}

function formatDate(value: string | undefined) {
    if (value === undefined || value.length === 0) {
        return "—";
    }
    const timestamp = Number(value) * 1000;
    if (Number.isNaN(timestamp)) {
        return value;
    }
    return new Date(timestamp).toLocaleString();
}

type DeviceDetailsProps = {
    item: Item;
};

function DeviceDetails(props: DeviceDetailsProps) {
    const { item } = props;
    const markdown = `# ${item.alias.length > 0 ? item.alias : item.phone}

## State

| Field | Value |
| --- | --- |
| Armed | ${boolLabel(item.car_state.arm)} |
| Alarm | ${boolLabel(item.car_state.alarm)} |
| Engine running | ${boolLabel(item.car_state.run)} |
| Ignition | ${boolLabel(item.car_state.ign)} |
| Service mode | ${boolLabel(item.car_state.valet)} |
| Webasto | ${boolLabel(item.car_state.webasto)} |
| Hands/free | ${item.functions.includes("hfree") ? "Supported" : "—"} |

## Sensors

| Field | Value |
| --- | --- |
| Door | ${boolLabel(item.car_state.door)} |
| Hood | ${boolLabel(item.car_state.hood)} |
| Trunk | ${boolLabel(item.car_state.trunk)} |
| Handbrake | ${boolLabel(item.car_state.hbrake)} |
| Shock bypass | ${boolLabel(item.car_state.shock_bpass)} |
| Tilt bypass | ${boolLabel(item.car_state.tilt_bpass)} |
| Additional sensor bypass | ${boolLabel(item.car_state.add_sens_bpass)} |

## Telemetry

| Field | Value |
| --- | --- |
| Cabin temperature | ${item.ctemp}°C |
| Engine temperature | ${item.etemp}°C |
| Battery | ${displayString(item.battery)} |
| GSM level | ${displayString(item.gsm_lvl)} |
| Balance | ${displayString(item.balance.active.value)} ${item.balance.active.currency} |
| Last activity | ${formatDate(item.ts_activity)} |

## Position

| Field | Value |
| --- | --- |
| Latitude / X | ${displayString(item.position.x)} |
| Longitude / Y | ${displayString(item.position.y)} |
| Radius | ${displayString(item.position.r)} |
| Timestamp | ${formatDate(item.position.ts)} |

## Device

| Field | Value |
| --- | --- |
| ID | ${item.device_id} |
| IMEI | ${displayString(item.imei)} |
| Serial | ${displayString(item.sn)} |
| Phone | ${displayString(item.phone)} |
| Type | ${item.typename.length > 0 ? item.typename : displayString(item.type)} |
| Firmware | ${displayString(item.fw_version)} |
`;

    return <Detail markdown={markdown} />;
}

export default DeviceDetails;
