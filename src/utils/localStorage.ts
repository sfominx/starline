import { LocalStorage } from "@raycast/api";

import { EOL_MAPPING, SECRETS_LIFETIME_HOURS } from "../starline/constants";

type ExpiringStorageKey = keyof typeof EOL_MAPPING;

const HOUR_MS = 60 * 60 * 1000;

export async function setItemWithLifetime(key: ExpiringStorageKey, value: string) {
    await Promise.all([
        LocalStorage.setItem(key, value),
        LocalStorage.setItem(EOL_MAPPING[key], Date.now() + SECRETS_LIFETIME_HOURS[key] * HOUR_MS),
    ]);
}

export async function getItem(key: ExpiringStorageKey): Promise<string | undefined> {
    const [value, expiresAtValue] = await Promise.all([
        LocalStorage.getItem(key),
        LocalStorage.getItem(EOL_MAPPING[key]),
    ]);
    const expiresAt = Number(expiresAtValue);

    if (Number.isFinite(expiresAt) && expiresAt >= Date.now()) {
        return value?.toString();
    }

    await Promise.all([LocalStorage.removeItem(key), LocalStorage.removeItem(EOL_MAPPING[key])]);
    return undefined;
}
