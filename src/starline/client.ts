import { createHash } from "crypto";

import { LocalStorage, getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";

import { CaptchaNeededError, DisplayableError } from "../utils/errors";
import { hasText } from "../utils/format";
import { getItem, setItemWithLifetime } from "../utils/localStorage";

import { LOCAL_STORAGE, STARLINE_ORIGINS } from "./constants";
import { idApiV3Url } from "./urls";

type HttpMethod = "get" | "post" | "delete";
type RequestOptions = { method?: HttpMethod; body?: unknown; retryOnAuthError?: boolean };
type ApiV3Response<TDesc extends Record<string, unknown>> = { state: number; desc: TDesc };
type AuthTokens = { userId: string; slnetUserToken: string };
type StoredSecretKey =
    | typeof LOCAL_STORAGE.APP_CODE
    | typeof LOCAL_STORAGE.APP_TOKEN
    | typeof LOCAL_STORAGE.SLID_USER_TOKEN
    | typeof LOCAL_STORAGE.SLNET_TOKEN;
type LoginResponse = ApiV3Response<{
    message?: string;
    captchaSid?: string;
    captchaImg?: string;
    user_token?: string;
}>;

const JSON_HEADERS = { "Content-Type": "application/json" };
const CAPTCHA_NEEDED_MESSAGE = "Captcha needed.";
const AUTH_CACHE_KEYS = Object.values(LOCAL_STORAGE).filter(
    (key) => key !== LOCAL_STORAGE.DEFAULT_DEVICE,
);

const hash = (algorithm: "md5" | "sha1", value: string) =>
    createHash(algorithm).update(value).digest("hex");
const md5 = (value: string) => hash("md5", value);
const sha1 = (value: string) => hash("sha1", value);
const parseSlnetCookie = (setCookie: string | null) =>
    /(?:^|[,;\s])slnet=([^;,\s]+)/.exec(setCookie ?? "")?.[1];

async function readJson<T>(response: { json: () => Promise<unknown> }) {
    return (await response.json()) as T;
}

async function readOptionalJson<T>(response: { text: () => Promise<string> }) {
    const text = await response.text();
    if (text === "") {
        return {} as T;
    }

    try {
        return JSON.parse(text) as T;
    } catch {
        return { message: text } as T;
    }
}

function isAuthError(status: number, data: unknown) {
    if ([401, 403].includes(status)) {
        return true;
    }

    const { code, message, codestring } = data as {
        code?: number;
        message?: string;
        codestring?: string;
    };
    const text = `${message ?? ""} ${codestring ?? ""}`.toLowerCase();

    return code === 401 || text.includes("auth") || text.includes("token");
}

function apiValueOrThrow<TDesc extends Record<string, unknown>>(
    data: ApiV3Response<TDesc>,
    select: (desc: TDesc) => string | undefined,
    fallbackMessage: string,
) {
    const value = select(data.desc);
    if (data.state === 1 && hasText(value)) {
        return value;
    }

    const message = (data.desc.message as string | undefined) ?? fallbackMessage;
    throw new DisplayableError(data.state === 0 ? message : `Unknown API state: ${data.state}`);
}

function apiFailureMessage(data: unknown) {
    const { message, codestring } = data as { message?: string; codestring?: string };
    return message ?? codestring ?? "API call failed";
}

function isFailedApiEnvelope(data: unknown) {
    const { code } = data as { code?: number };
    return code !== undefined && code !== 200;
}

export class StarLineClient {
    private readonly appId: string;

    private readonly secret: string;

    private readonly username: string;

    private readonly password: string;

    constructor() {
        const { AppId, Secret, Login, Password } = getPreferenceValues<Preferences>();
        this.appId = AppId;
        this.secret = Secret;
        this.username = Login;
        this.password = Password;
    }

    static async clearAuthCache() {
        await Promise.all(AUTH_CACHE_KEYS.map((key) => LocalStorage.removeItem(key)));
    }

    clearAuthCache() {
        return StarLineClient.clearAuthCache();
    }

    private async cachedSecret(key: StoredSecretKey, load: () => Promise<string>) {
        const cached = await getItem(key);
        if (cached !== undefined) {
            return cached;
        }

        const value = await load();
        await setItemWithLifetime(key, value);
        return value;
    }

    private getAppCode() {
        return this.cachedSecret(LOCAL_STORAGE.APP_CODE, async () => {
            const response = await fetch(
                idApiV3Url("application/getCode", { appId: this.appId, secret: md5(this.secret) }),
            );
            const data =
                await readJson<ApiV3Response<{ code?: string; message?: string }>>(response);
            return apiValueOrThrow(data, ({ code }) => code, "Failed to get app code");
        });
    }

    private getAppToken() {
        return this.cachedSecret(LOCAL_STORAGE.APP_TOKEN, async () => {
            const code = await this.getAppCode();
            const response = await fetch(
                idApiV3Url("application/getToken", {
                    appId: this.appId,
                    secret: md5(this.secret + code),
                }),
            );
            const data =
                await readJson<ApiV3Response<{ token?: string; message?: string }>>(response);
            return apiValueOrThrow(data, ({ token }) => token, "Failed to get app token");
        });
    }

    async loginWithCaptcha(captchaSid: string, captchaCode: string) {
        await LocalStorage.removeItem(LOCAL_STORAGE.SLID_USER_TOKEN);
        return this.login(captchaSid, captchaCode);
    }

    private login(captchaSid?: string, captchaCode?: string) {
        return this.cachedSecret(LOCAL_STORAGE.SLID_USER_TOKEN, async () => {
            const data = await this.requestLogin(captchaSid, captchaCode);

            if (data.state === 0) {
                await this.handleLoginError(data.desc);
            }

            return apiValueOrThrow(data, ({ user_token: token }) => token, "Login failed");
        });
    }

    private async requestLogin(captchaSid?: string, captchaCode?: string) {
        const form = new URLSearchParams({ login: this.username, pass: sha1(this.password) });

        if (hasText(captchaSid) && hasText(captchaCode)) {
            form.append("captchaSid", captchaSid);
            form.append("captchaCode", captchaCode);
        }

        const response = await fetch(idApiV3Url("user/login"), {
            method: "POST",
            body: form,
            headers: { token: await this.getAppToken() },
        });
        return readJson<LoginResponse>(response);
    }

    private async handleLoginError({ message, captchaSid, captchaImg }: LoginResponse["desc"]) {
        const needsCaptcha =
            message === CAPTCHA_NEEDED_MESSAGE && hasText(captchaSid) && hasText(captchaImg);

        if (!needsCaptcha) {
            throw new DisplayableError(message ?? "Login failed");
        }

        await Promise.all([
            LocalStorage.setItem(LOCAL_STORAGE.CAPTCHA_SID, captchaSid),
            LocalStorage.setItem(LOCAL_STORAGE.CAPTCHA_IMG, captchaImg),
        ]);
        throw new CaptchaNeededError(message, captchaSid, captchaImg);
    }

    protected async auth(): Promise<AuthTokens> {
        const [cachedUserId, cachedToken] = await Promise.all([
            LocalStorage.getItem(LOCAL_STORAGE.USER_ID),
            getItem(LOCAL_STORAGE.SLNET_TOKEN),
        ]);

        if (cachedUserId !== undefined && cachedToken !== undefined) {
            return { userId: cachedUserId.toString(), slnetUserToken: cachedToken };
        }

        const response = await fetch(`${STARLINE_ORIGINS.developer}json/v2/auth.slid`, {
            method: "post",
            body: JSON.stringify({ slid_token: await this.login() }),
            headers: JSON_HEADERS,
        });
        const data = await readJson<{ user_id: string }>(response);
        const slnetUserToken = parseSlnetCookie(response.headers.get("set-cookie"));

        if (!hasText(slnetUserToken)) {
            throw new DisplayableError("Failed to parse SLNet token from auth response");
        }

        await Promise.all([
            LocalStorage.setItem(LOCAL_STORAGE.USER_ID, data.user_id),
            setItemWithLifetime(LOCAL_STORAGE.SLNET_TOKEN, slnetUserToken),
        ]);

        return { userId: data.user_id, slnetUserToken };
    }

    protected async clearWebApiAuthCache() {
        await Promise.all([
            LocalStorage.removeItem(LOCAL_STORAGE.SLNET_TOKEN),
            LocalStorage.removeItem(LOCAL_STORAGE.SLNET_TOKEN_EOL),
            LocalStorage.removeItem(LOCAL_STORAGE.USER_ID),
        ]);
    }

    protected async request<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
        const { method = "get", body, retryOnAuthError = true } = options;
        const { slnetUserToken } = await this.auth();
        const response = await fetch(url, {
            method,
            body: body === undefined ? undefined : JSON.stringify(body),
            headers: { cookie: `slnet=${slnetUserToken}`, ...JSON_HEADERS },
        });
        const data = await readOptionalJson<T>(response);

        if (response.status === 200 && !isFailedApiEnvelope(data)) {
            return data;
        }

        if (retryOnAuthError && isAuthError(response.status, data)) {
            await this.clearWebApiAuthCache();
            return this.request<T>(url, { method, body, retryOnAuthError: false });
        }

        throw new DisplayableError(apiFailureMessage(data));
    }
}
