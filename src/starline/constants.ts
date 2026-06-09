export const DEVELOPER_STARLINE = "https://developer.starline.ru/";
export const ID_STARLINE = "https://id.starline.ru/";

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
};

export const EOL_MAPPING = {
    [LOCAL_STORAGE.APP_CODE]: LOCAL_STORAGE.APP_CODE_EOL,
    [LOCAL_STORAGE.APP_TOKEN]: LOCAL_STORAGE.APP_TOKEN_EOL,
    [LOCAL_STORAGE.SLID_USER_TOKEN]: LOCAL_STORAGE.SLID_USER_TOKEN_EOL,
    [LOCAL_STORAGE.SLNET_TOKEN]: LOCAL_STORAGE.SLNET_TOKEN_EOL,
};

export const SECRETS_LIFETIME_HOURS = {
    [LOCAL_STORAGE.APP_CODE]: 1,
    [LOCAL_STORAGE.APP_TOKEN]: 4,
    [LOCAL_STORAGE.SLID_USER_TOKEN]: 4,
    [LOCAL_STORAGE.SLNET_TOKEN]: 24,
};
