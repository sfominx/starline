export const EMPTY_VALUE = "—";

export type MarkdownRow = [unknown, unknown, ...unknown[]];

type NamedDevice = {
    alias: string;
    phone: string;
};

export const deviceTitle = ({ alias, phone }: NamedDevice) => (hasText(alias) ? alias : phone);

export function hasText(value: string | undefined): value is string {
    return value !== undefined && value.length > 0;
}

export function displayString(value: unknown): string {
    if (value === undefined || value === null || value === "") {
        return EMPTY_VALUE;
    }

    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
        return value.toString();
    }

    if (typeof value === "string") {
        return value;
    }

    return JSON.stringify(value);
}

export function formatUnixTimestamp(value?: number | string) {
    if (value === undefined || value === "") {
        return EMPTY_VALUE;
    }

    const timestamp = typeof value === "string" ? Number(value) : value;
    return Number.isNaN(timestamp) ? String(value) : new Date(timestamp * 1000).toLocaleString();
}

export function statusLabel(
    value: boolean | undefined,
    enabledLabel: string,
    disabledLabel: string,
) {
    if (value === undefined) {
        return EMPTY_VALUE;
    }

    return value ? enabledLabel : disabledLabel;
}

export function enabledDisabledLabel(value: boolean | undefined) {
    return statusLabel(value, "Включено", "Выключено");
}

export function openClosedLabel(value: boolean | undefined) {
    return statusLabel(value, "Открыто", "Закрыто");
}

export function markdownSection(title: string, rows: MarkdownRow[]) {
    return `## ${title}\n\n${markdownTable(["Field", "Value"], rows)}`;
}

export function jsonCodeBlock(value: unknown, spaces = 2) {
    return `\`\`\`json\n${JSON.stringify(value, null, spaces)}\n\`\`\``;
}

export function markdownTable(headers: string[], rows: MarkdownRow[]) {
    const header = `| ${headers.join(" | ")} |`;
    const divider = `| ${headers.map(() => "---").join(" | ")} |`;
    const body = rows.map((row) => `| ${row.map(displayString).join(" | ")} |`);

    return [header, divider, ...(body.length > 0 ? body : [emptyTableRow(headers.length)])].join(
        "\n",
    );
}

function emptyTableRow(columns: number) {
    return `| ${Array.from({ length: columns }, () => EMPTY_VALUE).join(" | ")} |`;
}
