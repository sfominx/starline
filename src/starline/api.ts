import { LocalStorage, getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";
import { createHash } from "crypto";
import { DEVELOPER_STARLINE, ID_STARLINE, LOCAL_STORAGE } from "./constants";
import { CaptchaNeededError, DisplayableError } from "../utils/errors";
import { CarStatus, Devices } from "../types/devices";
import { getItem, setItemWithLifetime } from "../utils/localStorage";

function deviceSetParamUrl(deviceId: string) {
    return `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/set_param`;
}

type StarLineCommandValue = string | number | boolean;

type StarLineCommandBody = Record<string, unknown> & {
    type: string;
};

type HttpMethod = "get" | "post" | "delete";

type RequestOptions = {
    retryOnAuthError?: boolean;
};

function parseSlnetCookie(setCookie: string | null) {
    if (!setCookie) return undefined;

    const match = setCookie.match(/(?:^|[,;\s])slnet=([^;,\s]+)/);
    return match?.[1];
}

function isAuthError(responseStatus: number, data: unknown) {
    if (responseStatus === 401 || responseStatus === 403) return true;

    const errorData = data as { code?: number; message?: string; codestring?: string };
    const message = `${errorData.message || ""} ${errorData.codestring || ""}`.toLowerCase();

    return errorData.code === 401 || message.includes("auth") || message.includes("token");
}

export class StarLine {
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

    async initialize(): Promise<this> {
        /**
         * Initialize the API client
         */
        return this;
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

    async clearAuthCache() {
        return StarLine.clearAuthCache();
    }

    private async clearWebApiAuthCache() {
        await Promise.all([
            LocalStorage.removeItem(LOCAL_STORAGE.SLNET_TOKEN),
            LocalStorage.removeItem(LOCAL_STORAGE.SLNET_TOKEN_EOL),
            LocalStorage.removeItem(LOCAL_STORAGE.USER_ID),
        ]);
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

            if (data.state === 0 && data.desc.message) {
                throw new DisplayableError(data.desc.message);
            }

            if (data.state === 1 && data.desc.code) {
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
                .update(this.Secret + appCode)
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

            if (data.state === 1 && data.desc.token) {
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

            if (captchaSid && captchaCode) {
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
                    data.desc.captchaSid &&
                    data.desc.captchaImg
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

            if (data.state === 1 && data.desc.user_token) {
                await setItemWithLifetime(LOCAL_STORAGE.SLID_USER_TOKEN, data.desc.user_token);
                return data.desc.user_token;
            }

            throw new DisplayableError(`Unknown error: ${data.state}`);
        } else {
            return SlidUserToken;
        }
    }

    private async auth() {
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

            if (!slnetUserTokenFromCookie) {
                throw new DisplayableError("Failed to parse SLNet token from auth response");
            }

            await setItemWithLifetime(LOCAL_STORAGE.SLNET_TOKEN, slnetUserTokenFromCookie);

            return { userId: data.user_id, slnetUserToken: slnetUserTokenFromCookie };
        }
        return { userId, slnetUserToken };
    }

    async getDevices(): Promise<{ result?: Devices; error?: string }> {
        /**
         * Get user devices
         */
        const { userId } = await this.auth();

        const url = `${DEVELOPER_STARLINE}json/v2/user/${userId}/user_info`;
        const data = await this.request<Devices>(url);

        if (data) {
            const defaultDevice = Number(
                await LocalStorage.getItem<number>(LOCAL_STORAGE.DEFAULT_DEVICE),
            );

            data.devices.forEach((element, index) => {
                data.devices[index].default = element.device_id === defaultDevice;
            });

            return { result: data };
        }
        return { error: "error" };
    }

    private async request<T = unknown>(
        url: string,
        method: HttpMethod = "get",
        body?: unknown,
        options: RequestOptions = { retryOnAuthError: true },
    ): Promise<T> {
        /**
         * Make WebAPI call with SLNet cookie auth.
         */
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
        const data = text ? (JSON.parse(text) as T) : ({} as T);

        if (response.status === 200) {
            return data;
        }

        if (options.retryOnAuthError && isAuthError(response.status, data)) {
            await this.clearWebApiAuthCache();
            return this.request<T>(url, method, body, { retryOnAuthError: false });
        }

        const errorData = data as { message?: string; codestring?: string };
        throw new DisplayableError(errorData.message || errorData.codestring || "API call failed");
    }

    private async apiCall(url: string, body: unknown) {
        /**
         * Make POST API call
         */
        return this.request(url, "post", body);
    }

    private commandBody(type: string, value: StarLineCommandValue = 1): StarLineCommandBody {
        return { type, [type]: value };
    }

    async sendCommand<T = unknown>(
        deviceId: string,
        type: string,
        value: StarLineCommandValue = 1,
    ) {
        /**
         * Execute device command via legacy blocking /set_param endpoint.
         */
        return this.apiCall(
            deviceSetParamUrl(deviceId),
            this.commandBody(type, value),
        ) as Promise<T>;
    }

    async sendAsyncCommand<T = unknown>(
        deviceId: string,
        type: string,
        value: StarLineCommandValue = 1,
    ) {
        /**
         * Execute device command via non-blocking /async endpoint.
         */
        const url = `${DEVELOPER_STARLINE}json/v2/device/${deviceId}/async`;
        return this.request<T>(url, "post", { type, value });
    }

    async getAsyncCommandStatus<T = unknown>(deviceId: string, commandId: string) {
        const url = `${DEVELOPER_STARLINE}json/v2/device/${deviceId}/async/${commandId}`;
        return this.request<T>(url);
    }

    async startEngine(deviceId: string) {
        /**
         * Start engine
         */
        return this.sendCommand(deviceId, "ign_start");
    }

    async stopEngine(deviceId: string) {
        /**
         * Stop engine
         */
        return this.sendCommand(deviceId, "ign_stop");
    }

    async engineOn(deviceId: string) {
        return this.sendCommand(deviceId, "ign", 1);
    }

    async engineOff(deviceId: string) {
        return this.sendCommand(deviceId, "ign", 0);
    }

    async arm(deviceId: string): Promise<CarStatus> {
        /**
         * Arm device
         */
        const data = await this.sendCommand<CarStatus>(deviceId, "arm_start");

        return data;
    }

    async disarm(deviceId: string): Promise<CarStatus> {
        /**
         * Disarm device
         */
        const data = await this.sendCommand<CarStatus>(deviceId, "arm_stop");

        return data;
    }

    async armQuietly(deviceId: string): Promise<CarStatus> {
        /**
         * Arm quiet device
         */
        return this.sendCommand<CarStatus>(deviceId, "arm_quiet", 1);
    }

    async disarmQuietly(deviceId: string): Promise<CarStatus> {
        /**
         * Disarm quiet device
         */
        return this.sendCommand<CarStatus>(deviceId, "arm_quiet", 0);
    }

    async armStartQuietly(deviceId: string): Promise<CarStatus> {
        return this.sendCommand<CarStatus>(deviceId, "arm_start_quiet");
    }

    async armStopQuietly(deviceId: string): Promise<CarStatus> {
        return this.sendCommand<CarStatus>(deviceId, "arm_stop_quiet");
    }

    async shockSensorBypass(deviceId: string) {
        /**
         * Shock sensor bypass
         */
        return this.sendCommand(deviceId, "shock_bpass");
    }

    async tiltSensorBypass(deviceId: string) {
        /**
         * Tilt sensor bypass
         */
        return this.sendCommand(deviceId, "tilt_bpass");
    }

    async additionalSensorBypass(deviceId: string) {
        /**
         * Additional sensor bypass
         */
        return this.sendCommand(deviceId, "add_sens_bpass");
    }

    async serviceModeEnable(deviceId: string) {
        /**
         * Service mode enable
         */
        return this.sendCommand(deviceId, "valet", 1);
    }

    async serviceModeDisable(deviceId: string) {
        /**
         * Service mode disable
         */
        return this.sendCommand(deviceId, "valet", 0);
    }

    async handsFreeModeEnable(deviceId: string) {
        /**
         * Hands free mode enable
         */
        return this.sendCommand(deviceId, "hfree", 1);
    }

    async handsFreeModeDisable(deviceId: string) {
        /**
         * Hands free mode disable
         */
        return this.sendCommand(deviceId, "hfree", 0);
    }

    async horn(deviceId: string) {
        /**
         * Horn
         */
        return this.sendCommand(deviceId, "poke");
    }

    async disarmTrunk(deviceId: string) {
        /**
         * Disarm trunk
         */
        return this.sendCommand(deviceId, "disarm_trunk");
    }

    async panic(deviceId: string) {
        /**
         * Panic
         */
        return this.sendCommand(deviceId, "panic");
    }

    async getBalance(deviceId: string, simNumber: 1 | 2 = 1) {
        return this.sendCommand(deviceId, "getbalance", simNumber);
    }

    async updatePosition(deviceId: string) {
        return this.sendCommand(deviceId, "update_position");
    }

    async outputOn(deviceId: string) {
        return this.sendCommand(deviceId, "out", 1);
    }

    async outputOff(deviceId: string) {
        return this.sendCommand(deviceId, "out", 0);
    }

    async dvrOn(deviceId: string) {
        return this.sendCommand(deviceId, "dvr", 1);
    }

    async dvrOff(deviceId: string) {
        return this.sendCommand(deviceId, "dvr", 0);
    }

    async webastoEnable(deviceId: string) {
        return this.sendCommand(deviceId, "webasto", 1);
    }

    async webastoDisable(deviceId: string) {
        return this.sendCommand(deviceId, "webasto", 0);
    }

    async webastoOn(deviceId: string) {
        /**
         * Turn on Webasto
         */
        return this.sendCommand(deviceId, "webasto_on");
    }

    async webastoOff(deviceId: string) {
        /**
         * Turn off Webasto
         */
        return this.sendCommand(deviceId, "webasto_off");
    }

    async flex(deviceId: string, number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) {
        return this.sendCommand(deviceId, `flex_${number}`);
    }

    async getControlsLibrary<T = unknown>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/device/${deviceId}/ctrls_library`);
    }

    async getDeviceInfo<T = unknown>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v1/device/${deviceId}/info`);
    }

    async updateDeviceInfo<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/info`,
            "post",
            body,
        );
    }

    async getWays<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/ways`,
            "post",
            body,
        );
    }

    async updateControls<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v2/device/${deviceId}/controls`,
            "post",
            body,
        );
    }

    async getObdParams<T = unknown>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/device/${deviceId}/obd_params`);
    }

    async getPosition<T = unknown>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v1/device/${deviceId}/position`);
    }

    async getState<T = unknown>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v2/device/${deviceId}/state`);
    }

    async getEvents<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v2/device/${deviceId}/events`,
            "post",
            body,
        );
    }

    async getEventDescription<T = unknown>(eventId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v3/library/events/${eventId}`);
    }

    async getEventsLibrary<T = unknown>() {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v3/library/events`);
    }

    async getObdErrors<T = unknown>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/device/${deviceId}/obd_errors`);
    }

    async getDeviceData<T = unknown>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v3/device/${deviceId}/data`);
    }

    async getDeviceReport<T = unknown>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v2/device/${deviceId}`);
    }

    async putComfortOptions<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/put_comfort_options`,
            "post",
            body,
        );
    }

    async getSupportedComfortOptions<T = unknown>(deviceId: string) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/supported_comfort_options`,
        );
    }

    async updateWebastoSettings<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/settings/webasto`,
            "post",
            body,
        );
    }

    async updateRemoteStartSettings<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v2/device/${deviceId}/settings/remote_start`,
            "post",
            body,
        );
    }

    async updateShockSensorSettings<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/settings/shock_sens`,
            "post",
            body,
        );
    }

    async updateMonitoringSettings<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/settings/monitoring`,
            "post",
            body,
        );
    }

    async getSettings<T = unknown>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v4/device/${deviceId}/settings`);
    }

    async getMobileDevices<T = unknown>() {
        const { userId } = await this.auth();
        return this.request<T>(`${DEVELOPER_STARLINE}json/v1/user/${userId}/mobile_devices`);
    }

    async getUserDevices<T = unknown>() {
        const { userId } = await this.auth();
        return this.request<T>(`${DEVELOPER_STARLINE}json/v1/user/${userId}/devices`);
    }

    async getLbsPosition<T = unknown>() {
        const { userId } = await this.auth();
        return this.request<T>(`${DEVELOPER_STARLINE}json/v1/user/${userId}/lbs_position`);
    }

    async postLbsPosition<T = unknown>(body: unknown) {
        const { userId } = await this.auth();
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v1/user/${userId}/lbs_position`,
            "post",
            body,
        );
    }

    async enableDataTransfer<T = unknown>(body: unknown) {
        const { userId } = await this.auth();
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v1/user/${userId}/data_transfer`,
            "post",
            body,
        );
    }

    async getDataTransfer<T = unknown>() {
        const { userId } = await this.auth();
        return this.request<T>(`${DEVELOPER_STARLINE}json/v1/user/${userId}/data_transfer`);
    }

    async disableDataTransfer<T = unknown>() {
        const { userId } = await this.auth();
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v1/user/${userId}/data_transfer`,
            "delete",
        );
    }

    async getDrivingScore<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v2/device/${deviceId}/driving_score`,
            "post",
            body,
        );
    }

    async getDrivingScoreHistory<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v2/device/${deviceId}/driving_score_history`,
            "post",
            body,
        );
    }

    async getObdData<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/getObdData`,
            "post",
            body,
        );
    }

    async getDeviceList<T = unknown>() {
        const { userId } = await this.auth();
        return this.request<T>(`${DEVELOPER_STARLINE}json/v1/user/${userId}/deviceList`);
    }

    async getDetails<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/details`,
            "post",
            body,
        );
    }
}

export default StarLine;
