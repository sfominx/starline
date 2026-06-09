import { createHash } from "crypto";

import { LocalStorage, getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";

import { CaptchaNeededError, DisplayableError } from "../utils/errors";
import { getItem, setItemWithLifetime } from "../utils/localStorage";

import { DEVELOPER_STARLINE, ID_STARLINE, LOCAL_STORAGE } from "./constants";

type HttpMethod = "get" | "post" | "delete";

type RequestOptions = {
    method?: HttpMethod;
    body?: unknown;
    retryOnAuthError?: boolean;
};

type ApiV3Response<TDesc extends Record<string, unknown>> = {
    state: number;
    desc: TDesc;
};

type AuthTokens = {
    userId: LocalStorage.Value;
    slnetUserToken: string;
};

const AUTH_CACHE_KEYS = [
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
] as const;

function parseSlnetCookie(setCookie: string | null) {
    if (setCookie === null || setCookie.length === 0) {
        return undefined;
    }

    const match = /(?:^|[,;\s])slnet=([^;,\s]+)/.exec(setCookie);
    return match?.[1];
}

function hasText(value: string | undefined): value is string {
    return value !== undefined && value.length > 0;
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
        await Promise.all(AUTH_CACHE_KEYS.map((key) => LocalStorage.removeItem(key)));
    }

    clearAuthCache() {
        return StarLineClient.clearAuthCache();
    }

    private async getAppCode() {
        const cachedAppCode = await getItem(LOCAL_STORAGE.APP_CODE);

        if (cachedAppCode !== undefined) {
            return cachedAppCode;
        }

        const secretHash = createHash("md5").update(this.Secret).digest("hex");
        const url = `${ID_STARLINE}apiV3/application/getCode?appId=${this.AppId}&secret=${secretHash}`;
        const response = await fetch(url);
        const data = (await response.json()) as ApiV3Response<{
            code?: string;
            message?: string;
        }>;

        if (data.state === 0 && hasText(data.desc.message)) {
            throw new DisplayableError(data.desc.message);
        }

        if (data.state === 1 && hasText(data.desc.code)) {
            await setItemWithLifetime(LOCAL_STORAGE.APP_CODE, data.desc.code);
            return data.desc.code;
        }

        throw new DisplayableError(`Unknown error: ${data.state}`);
    }

    private async getAppToken() {
        const cachedToken = await getItem(LOCAL_STORAGE.APP_TOKEN);

        if (cachedToken !== undefined) {
            return cachedToken;
        }

        const appCode = await this.getAppCode();
        const secretHash = createHash("md5")
            .update(this.Secret + appCode)
            .digest("hex");
        const url = `${ID_STARLINE}apiV3/application/getToken?appId=${this.AppId}&secret=${secretHash}`;
        const response = await fetch(url);
        const data = (await response.json()) as ApiV3Response<{
            token?: string;
            message?: string;
        }>;

        if (data.state === 0) {
            throw new DisplayableError(data.desc.message ?? "Failed to get app token");
        }

        if (data.state === 1 && hasText(data.desc.token)) {
            await setItemWithLifetime(LOCAL_STORAGE.APP_TOKEN, data.desc.token);
            return data.desc.token;
        }

        throw new DisplayableError(`Unknown error: ${data.state}`);
    }

    async loginWithCaptcha(captchaSid: string, captchaCode: string) {
        await LocalStorage.removeItem(LOCAL_STORAGE.SLID_USER_TOKEN);
        return this.login(captchaSid, captchaCode);
    }

    private async login(captchaSid?: string, captchaCode?: string) {
        const cachedToken = await getItem(LOCAL_STORAGE.SLID_USER_TOKEN);

        if (cachedToken !== undefined) {
            return cachedToken;
        }

        const form = new URLSearchParams({
            login: this.Login,
            pass: createHash("sha1").update(this.Password).digest("hex"),
        });

        if (hasText(captchaSid) && hasText(captchaCode)) {
            form.append("captchaSid", captchaSid);
            form.append("captchaCode", captchaCode);
        }

        const response = await fetch(`${ID_STARLINE}apiV3/user/login`, {
            method: "POST",
            body: form,
            headers: { token: await this.getAppToken() },
        });
        const data = (await response.json()) as ApiV3Response<{
            message?: string;
            captchaSid?: string;
            captchaImg?: string;
            user_token?: string;
        }>;

        if (data.state === 0) {
            await this.handleLoginError(data.desc);
        }

        if (data.state === 1 && hasText(data.desc.user_token)) {
            await setItemWithLifetime(LOCAL_STORAGE.SLID_USER_TOKEN, data.desc.user_token);
            return data.desc.user_token;
        }

        throw new DisplayableError(`Unknown error: ${data.state}`);
    }

    private async handleLoginError(desc: {
        message?: string;
        captchaSid?: string;
        captchaImg?: string;
    }) {
        if (
            desc.message !== "Captcha needed." ||
            !hasText(desc.captchaSid) ||
            !hasText(desc.captchaImg)
        ) {
            throw new DisplayableError(desc.message ?? "Login failed");
        }

        await LocalStorage.setItem(LOCAL_STORAGE.CAPTCHA_SID, desc.captchaSid);
        await LocalStorage.setItem(LOCAL_STORAGE.CAPTCHA_IMG, desc.captchaImg);
        throw new CaptchaNeededError(desc.message, desc.captchaSid, desc.captchaImg);
    }

    protected async auth(): Promise<AuthTokens> {
        const userId = await LocalStorage.getItem(LOCAL_STORAGE.USER_ID);
        const slnetUserToken = await getItem(LOCAL_STORAGE.SLNET_TOKEN);

        if (userId !== undefined && slnetUserToken !== undefined) {
            return { userId: userId.toString(), slnetUserToken };
        }

        const response = await fetch(`${DEVELOPER_STARLINE}json/v2/auth.slid`, {
            method: "post",
            body: JSON.stringify({ slid_token: await this.login() }),
            headers: { "Content-Type": "application/json" },
        });
        const data = (await response.json()) as { user_id: string };
        const tokenFromCookie = parseSlnetCookie(response.headers.get("set-cookie"));

        if (!hasText(tokenFromCookie)) {
            throw new DisplayableError("Failed to parse SLNet token from auth response");
        }

        await Promise.all([
            LocalStorage.setItem(LOCAL_STORAGE.USER_ID, data.user_id),
            setItemWithLifetime(LOCAL_STORAGE.SLNET_TOKEN, tokenFromCookie),
        ]);

        return { userId: data.user_id, slnetUserToken: tokenFromCookie };
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
