export function displayString(value: string | undefined) {
    return value !== undefined && value.length > 0 ? value : "—";
}

export function statusLabel(
    value: boolean | undefined,
    enabledLabel: string,
    disabledLabel: string,
) {
    if (value === undefined) {
        return "—";
    }

    return value ? enabledLabel : disabledLabel;
}

export function enabledDisabledLabel(value: boolean | undefined) {
    return statusLabel(value, "Включено", "Выключено");
}

export function openClosedLabel(value: boolean | undefined) {
    return statusLabel(value, "Открыто", "Закрыто");
}
