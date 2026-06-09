import { Detail } from "@raycast/api";

import { displayString, enabledDisabledLabel, openClosedLabel, statusLabel } from "../utils/format";

import type { Item } from "../types/devices";

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
| Armed | ${statusLabel(item.car_state.arm, "В охране", "Снято с охраны")} |
| Alarm | ${statusLabel(item.car_state.alarm, "Тревога", "Нет тревоги")} |
| Engine | ${statusLabel(item.car_state.run, "Запущен", "Остановлен")} |
| Ignition | ${enabledDisabledLabel(item.car_state.ign)} |
| Service mode | ${enabledDisabledLabel(item.car_state.valet)} |
| Webasto | ${enabledDisabledLabel(item.car_state.webasto)} |
| Hands/free | ${item.functions.includes("hfree") ? "Поддерживается" : "—"} |

## Sensors

| Field | Value |
| --- | --- |
| Door | ${openClosedLabel(item.car_state.door)} |
| Hood | ${openClosedLabel(item.car_state.hood)} |
| Trunk | ${openClosedLabel(item.car_state.trunk)} |
| Handbrake | ${statusLabel(item.car_state.hbrake, "Затянут", "Отпущен")} |
| Shock sensor bypass | ${enabledDisabledLabel(item.car_state.shock_bpass)} |
| Tilt sensor bypass | ${enabledDisabledLabel(item.car_state.tilt_bpass)} |
| Additional sensor bypass | ${enabledDisabledLabel(item.car_state.add_sens_bpass)} |

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
