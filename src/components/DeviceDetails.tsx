import React from "react";
import { Detail } from "@raycast/api";
import { Item } from "../types/devices";
import DevicesItemActionPanel from "./DeviceItemPanel";
import DevicesItemContext from "./context/deviceItem";

function boolLabel(value: boolean | undefined) {
    if (value === undefined) return "—";
    return value ? "Yes" : "No";
}

function formatDate(value: string | undefined) {
    if (!value) return "—";
    const timestamp = Number(value) * 1000;
    if (Number.isNaN(timestamp)) return value;
    return new Date(timestamp).toLocaleString();
}

type DeviceDetailsProps = {
    item: Item;
};

function DeviceDetails(props: DeviceDetailsProps) {
    const { item } = props;
    const markdown = `# ${item.alias || item.phone}

## State

| Field | Value |
| --- | --- |
| Armed | ${boolLabel(item.car_state.arm)} |
| Alarm | ${boolLabel(item.car_state.alarm)} |
| Engine running | ${boolLabel(item.car_state.run)} |
| Ignition | ${boolLabel(item.car_state.ign)} |
| Service mode | ${boolLabel(item.car_state.valet)} |
| Webasto | ${boolLabel(item.car_state.webasto)} |
| Hands/free | ${item.functions?.includes("hfree") ? "Supported" : "—"} |

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
| Battery | ${item.battery || "—"} |
| GSM level | ${item.gsm_lvl || "—"} |
| Balance | ${item.balance?.active?.value || "—"} ${item.balance?.active?.currency || ""} |
| Last activity | ${formatDate(item.ts_activity)} |

## Position

| Field | Value |
| --- | --- |
| Latitude / X | ${item.position?.x || "—"} |
| Longitude / Y | ${item.position?.y || "—"} |
| Radius | ${item.position?.r || "—"} |
| Timestamp | ${formatDate(item.position?.ts)} |

## Device

| Field | Value |
| --- | --- |
| ID | ${item.device_id} |
| IMEI | ${item.imei || "—"} |
| Serial | ${item.sn || "—"} |
| Phone | ${item.phone || "—"} |
| Type | ${item.typename || item.type || "—"} |
| Firmware | ${item.fw_version || "—"} |
`;

    return (
        <DevicesItemContext.Provider value={item}>
            <Detail
                markdown={markdown}
                actions={<DevicesItemActionPanel showDetailsAction={false} />}
            />
        </DevicesItemContext.Provider>
    );
}

export default DeviceDetails;
