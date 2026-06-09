export const STARLINE_ORIGINS = {
    developer: "https://developer.starline.ru/",
    id: "https://id.starline.ru/",
} as const;

export const API_VERSION = {
    v1: "v1",
    v2: "v2",
    v3: "v3",
    v4: "v4",
} as const;

export type ApiVersion = (typeof API_VERSION)[keyof typeof API_VERSION];

export const LOCAL_STORAGE = {
    CAPTCHA_SID: "starline-captcha-sid",
    CAPTCHA_IMG: "starline-captcha-img",
    APP_CODE: "starline-app-code",
    APP_CODE_EOL: "starline-app-code-eol",
    APP_TOKEN: "starline-app-token",
    APP_TOKEN_EOL: "starline-app-token-eol",
    SLID_USER_TOKEN: "starline-slid-user-token",
    SLID_USER_TOKEN_EOL: "starline-slid-user-token-eol",
    SLNET_TOKEN: "starline-slnet-token",
    SLNET_TOKEN_EOL: "starline-slnet-token-eol",
    USER_ID: "starline-user-id",
    DEFAULT_DEVICE: "starline-default-device",
} as const;

export const SECRETS_LIFETIME_HOURS = {
    [LOCAL_STORAGE.APP_CODE]: 1,
    [LOCAL_STORAGE.APP_TOKEN]: 4,
    [LOCAL_STORAGE.SLID_USER_TOKEN]: 4,
    [LOCAL_STORAGE.SLNET_TOKEN]: 24,
} as const;
