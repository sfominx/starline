import { createHash } from "crypto";

import { LocalStorage, getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";

import { CaptchaNeededError, DisplayableError } from "../utils/errors";
import { getItem, setItemWithLifetime } from "../utils/localStorage";

import { DEVELOPER_STARLINE, ID_STARLINE, LOCAL_STORAGE } from "./constants";

export type HttpMethod = "get" | "post" | "delete";

export type RequestOptions = {
    method?: HttpMethod;
    body?: unknown;
    retryOnAuthError?: boolean;
};

function parseSlnetCookie(setCookie: string | null) {
    if (setCookie === null || setCookie.length === 0) {
        return undefined;
    }

    const match = /(?:^|[,;\s])slnet=([^;,\s]+)/.exec(setCookie);
    return match?.[1];
}

function isAuthError(responseStatus: number, data: unknown) {
    if (responseStatus === 401 || responseStatus === 403) {
        return true;
    }

    const errorData = data as { code?: number; message?: string; codestring?: string };
    const message = `${errorData.message ?? ""} ${errorData.codestring ?? ""}`.toLowerCase();

    return errorData.code === 401 || message.includes("auth") || message.includes("token");
}

export class StarLineClient {
    private AppId: string;

    private Secret: string;

    private Login: string;

    private Password: string;

    constructor() {
        const { AppId, Secret, Login, Password } = getPreferenceValues<Preferences>();
        this.AppId = AppId;
        this.Secret = Secret;
        this.Login = Login;
        this.Password = Password;
    }

    initialize(): Promise<this> {
        /**
         * Initialize the API client
         */
        return Promise.resolve(this);
    }

    static async clearAuthCache() {
        await Promise.all(
            [
                LOCAL_STORAGE.CAPTCHA_SID,
                LOCAL_STORAGE.CAPTCHA_IMG,
                LOCAL_STORAGE.APP_CODE,
                LOCAL_STORAGE.APP_CODE_EOL,
                LOCAL_STORAGE.APP_TOKEN,
                LOCAL_STORAGE.APP_TOKEN_EOL,
                LOCAL_STORAGE.SLID_USER_TOKEN,
                LOCAL_STORAGE.SLID_USER_TOKEN_EOL,
                LOCAL_STORAGE.SLNET_TOKEN,
                LOCAL_STORAGE.SLNET_TOKEN_EOL,
                LOCAL_STORAGE.USER_ID,
            ].map((key) => LocalStorage.removeItem(key)),
        );
    }

    clearAuthCache() {
        return StarLineClient.clearAuthCache();
    }

    private async getAppCode() {
        /**
         * Get application code from StarLine API
         */
        const appCode = await getItem(LOCAL_STORAGE.APP_CODE);

        if (appCode === undefined) {
            const secretHash = createHash("md5").update(this.Secret).digest("hex");
            const args = `appId=${this.AppId}&secret=${secretHash}`;
            const url = `${ID_STARLINE}apiV3/application/getCode?${args}`;

            const response = await fetch(url);
            const data = (await response.json()) as {
                state: number;
                desc: {
                    code?: string;
                    message?: string;
                };
            };

            if (
                data.state === 0 &&
                data.desc.message !== undefined &&
                data.desc.message.length > 0
            ) {
                throw new DisplayableError(data.desc.message);
            }

            if (data.state === 1 && data.desc.code !== undefined && data.desc.code.length > 0) {
                await setItemWithLifetime(LOCAL_STORAGE.APP_CODE, data.desc.code);
                return data.desc.code;
            }

            throw new DisplayableError(`Unknown error: ${data.state}`);
        } else {
            return appCode;
        }
    }

    private async getAppToken() {
        /**
         * Get application token from StarLine API
         */
        const appCode = await this.getAppCode();
        const appToken = await getItem(LOCAL_STORAGE.APP_TOKEN);
        if (appToken === undefined) {
            const secretHash = createHash("md5")
                .update(this.Secret + appCode.toString())
                .digest("hex");
            const args = `appId=${this.AppId}&secret=${secretHash}`;
            const url = `${ID_STARLINE}apiV3/application/getToken?${args}`;

            const response = await fetch(url);
            const data = (await response.json()) as {
                state: number;
                desc: {
                    token?: string;
                    message?: string;
                };
            };

            if (data.state === 0) {
                throw new DisplayableError(data.desc.message);
            }

            if (data.state === 1 && data.desc.token !== undefined && data.desc.token.length > 0) {
                await setItemWithLifetime(LOCAL_STORAGE.APP_TOKEN, data.desc.token);
                return data.desc.token;
            }

            throw new DisplayableError(`Unknown error: ${data.state}`);
        } else {
            return appToken;
        }
    }

    async loginWithCaptcha(captchaSid: string, captchaCode: string) {
        await LocalStorage.removeItem(LOCAL_STORAGE.SLID_USER_TOKEN);
        return this.login(captchaSid, captchaCode);
    }

    private async login(captchaSid?: string, captchaCode?: string) {
        /**
         * Login user
         */
        const appToken = await this.getAppToken();

        const SlidUserToken = await getItem(LOCAL_STORAGE.SLID_USER_TOKEN);

        if (SlidUserToken === undefined) {
            const url = `${ID_STARLINE}apiV3/user/login`;

            const form = new URLSearchParams();
            form.append("login", this.Login);
            form.append("pass", createHash("sha1").update(this.Password).digest("hex"));

            if (
                captchaSid !== undefined &&
                captchaSid.length > 0 &&
                captchaCode !== undefined &&
                captchaCode.length > 0
            ) {
                form.append("captchaSid", captchaSid);
                form.append("captchaCode", captchaCode);
            }

            const response = await fetch(url, {
                method: "POST",
                body: form,
                headers: { token: appToken.toString() },
            });
            const data = (await response.json()) as {
                state: number;
                desc: {
                    token?: string;
                    message?: string;
                    phone?: string;
                    contactId?: string;
                    captchaSid?: string;
                    captchaImg?: string;
                    user_token?: string;
                };
            };

            if (data.state === 0) {
                if (
                    data.desc.message === "Captcha needed." &&
                    data.desc.captchaSid !== undefined &&
                    data.desc.captchaSid.length > 0 &&
                    data.desc.captchaImg !== undefined &&
                    data.desc.captchaImg.length > 0
                ) {
                    await LocalStorage.setItem(LOCAL_STORAGE.CAPTCHA_SID, data.desc.captchaSid);
                    await LocalStorage.setItem(LOCAL_STORAGE.CAPTCHA_IMG, data.desc.captchaImg);
                    throw new CaptchaNeededError(
                        data.desc.message,
                        data.desc.captchaSid,
                        data.desc.captchaImg,
                    );
                } else {
                    throw new DisplayableError(data.desc.message);
                }
            }

            if (
                data.state === 1 &&
                data.desc.user_token !== undefined &&
                data.desc.user_token.length > 0
            ) {
                await setItemWithLifetime(LOCAL_STORAGE.SLID_USER_TOKEN, data.desc.user_token);
                return data.desc.user_token;
            }

            throw new DisplayableError(`Unknown error: ${data.state}`);
        } else {
            return SlidUserToken;
        }
    }

    protected async auth() {
        /**
         * Authenticate user
         */
        const SlidUserToken = await this.login();

        const userId = await LocalStorage.getItem(LOCAL_STORAGE.USER_ID);
        const slnetUserToken = await getItem(LOCAL_STORAGE.SLNET_TOKEN);

        if (userId === undefined || slnetUserToken === undefined) {
            const url = `${DEVELOPER_STARLINE}json/v2/auth.slid`;
            const body = {
                slid_token: SlidUserToken,
            };
            const response = await fetch(url, {
                method: "post",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            });

            const data = (await response.json()) as { user_id: string };
            await LocalStorage.setItem(LOCAL_STORAGE.USER_ID, data.user_id);

            const slnetUserTokenFromCookie = parseSlnetCookie(response.headers.get("set-cookie"));

            if (slnetUserTokenFromCookie === undefined || slnetUserTokenFromCookie.length === 0) {
                throw new DisplayableError("Failed to parse SLNet token from auth response");
            }

            await setItemWithLifetime(LOCAL_STORAGE.SLNET_TOKEN, slnetUserTokenFromCookie);

            return { userId: data.user_id, slnetUserToken: slnetUserTokenFromCookie };
        }
        return { userId, slnetUserToken };
    }

    protected async clearWebApiAuthCache() {
        await Promise.all([
            LocalStorage.removeItem(LOCAL_STORAGE.SLNET_TOKEN),
            LocalStorage.removeItem(LOCAL_STORAGE.SLNET_TOKEN_EOL),
            LocalStorage.removeItem(LOCAL_STORAGE.USER_ID),
        ]);
    }

    protected async request<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
        /**
         * Make WebAPI call with SLNet cookie auth.
         */
        const { method = "get", body, retryOnAuthError = true } = options;
        const { slnetUserToken } = await this.auth();

        const response = await fetch(url, {
            method,
            body: body === undefined ? undefined : JSON.stringify(body),
            headers: {
                cookie: `slnet=${slnetUserToken}`,
                "Content-Type": "application/json",
            },
        });

        const text = await response.text();
        const data = text.length > 0 ? (JSON.parse(text) as T) : ({} as T);

        if (response.status === 200) {
            return data;
        }

        if (retryOnAuthError && isAuthError(response.status, data)) {
            await this.clearWebApiAuthCache();
            return this.request<T>(url, { method, body, retryOnAuthError: false });
        }

        const errorData = data as { message?: string; codestring?: string };
        throw new DisplayableError(errorData.message ?? errorData.codestring ?? "API call failed");
    }
}
