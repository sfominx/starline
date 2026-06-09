import { STARLINE_ORIGINS, type ApiVersion } from "./constants";

const joinPath = (...parts: Array<string | number | undefined>) =>
    parts
        .filter((part): part is string | number => part !== undefined && part !== "")
        .map((part) => part.toString().replace(/^\/+|\/+$/g, ""))
        .join("/");

const developerJsonUrl = (...parts: Array<string | number | undefined>) =>
    `${STARLINE_ORIGINS.developer}${joinPath("json", ...parts)}`;

export const idApiV3Url = (path: string, params?: Record<string, string>) => {
    const query = params === undefined ? "" : `?${new URLSearchParams(params).toString()}`;
    return `${STARLINE_ORIGINS.id}${joinPath("apiV3", path)}${query}`;
};

export const deviceUrl = (version: ApiVersion, deviceId: string, path?: string) =>
    developerJsonUrl(version, "device", deviceId, path);

export const legacyDeviceUrl = (deviceId: string, path: string) =>
    developerJsonUrl("device", deviceId, path);

export const userUrl = (version: ApiVersion, userId: string, path: string) =>
    developerJsonUrl(version, "user", userId, path);
