import { LocalStorage } from "@raycast/api";

import { EOL_MAPPING, SECRETS_LIFETIME_HOURS } from "../starline/constants";

export async function setItemWithLifetime(itemName: string, itemValue: string) {
    /**
     * Sets an item in local storage with an expiration time
     */

    await LocalStorage.setItem(itemName, itemValue);

    const expiration = new Date();
    expiration.setTime(expiration.getTime() + SECRETS_LIFETIME_HOURS[itemName] * 60 * 60 * 1000);

    await LocalStorage.setItem(EOL_MAPPING[itemName], expiration.getTime());
}

export async function getItem(itemName: string) {
    const expirationRaw = await LocalStorage.getItem(EOL_MAPPING[itemName]);

    if (expirationRaw === undefined) {
        return undefined;
    }

    const expiration = new Date(parseInt(expirationRaw.toString(), 10));

    if (expiration.getTime() < new Date().getTime()) {
        return undefined;
    }

    return LocalStorage.getItem(itemName);
}
