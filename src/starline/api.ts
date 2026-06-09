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

    private async login() {
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

            if ((data.state === 1, data.desc.user_token)) {
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

            const cookies = response.headers.get("set-cookie");
            const parsedCookies: { [key: string]: string } = {};
            if (cookies) {
                cookies.split(";").forEach((cookie) => {
                    const [key, value] = cookie.split("=");
                    parsedCookies[key.trim()] = value;
                });
            }

            await setItemWithLifetime(LOCAL_STORAGE.SLNET_TOKEN, parsedCookies.slnet);

            return { userId: data.user_id, slnetUserToken: parsedCookies.slnet };
        }
        return { userId, slnetUserToken };
    }

    async getDevices(): Promise<{ result?: Devices; error?: string }> {
        /**
         * Get user devices
         */
        const { userId, slnetUserToken } = await this.auth();

        const url = `${DEVELOPER_STARLINE}json/v2/user/${userId}/user_info`;
        const response = await fetch(url, {
            headers: {
                cookie: `slnet=${slnetUserToken}`,
            },
        });
        const data = (await response.json()) as Devices;

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

    private async apiCall(url: string, body: unknown) {
        /**
         * Make POST API call
         */
        const { slnetUserToken } = await this.auth();

        const response = await fetch(url, {
            method: "post",
            body: JSON.stringify(body),
            headers: { cookie: `slnet=${slnetUserToken}` },
        });
        if (response.status === 200) {
            return response.json();
        }

        throw new DisplayableError("API call failed");
    }

    async startEngine(deviceId: string) {
        /**
         * Start engine
         */
        const body = { type: "ign_start", ign_start: 1 };
        const data = await this.apiCall(deviceSetParamUrl(deviceId), body);

        console.log(data);
    }

    async stopEngine(deviceId: string) {
        /**
         * Stop engine
         */
        const body = { type: "ign_stop", ign_stop: 1 };
        const data = await this.apiCall(deviceSetParamUrl(deviceId), body);

        console.log(data);
    }

    async arm(deviceId: string): Promise<CarStatus> {
        /**
         * Arm device
         */
        const body = { type: "arm_start", arm_start: 1 };
        const data = (await this.apiCall(deviceSetParamUrl(deviceId), body)) as CarStatus;

        return data;
    }

    async disarm(deviceId: string): Promise<CarStatus> {
        /**
         * Disarm device
         */
        const body = { type: "arm_stop", arm_stop: 1 };
        const data = (await this.apiCall(deviceSetParamUrl(deviceId), body)) as CarStatus;

        return data;
    }

    async armQuietly(deviceId: string): Promise<CarStatus> {
        /**
         * Arm quiet device
         */
        const body = { type: "arm_quiet", arm_quiet: 1 };
        const data = (await this.apiCall(deviceSetParamUrl(deviceId), body)) as CarStatus;
        console.log(data);

        return data;
    }

    async disarmQuietly(deviceId: string): Promise<CarStatus> {
        /**
         * Disarm quiet device
         */
        const body = { type: "arm_quiet", arm_quiet: 0 };
        const data = (await this.apiCall(deviceSetParamUrl(deviceId), body)) as CarStatus;
        console.log(data);
        return data;
    }

    async shockSensorBypass(deviceId: string) {
        /**
         * Shock sensor bypass
         */
        const body = { type: "shock_bpass", shock_bpass: 1 };
        const data = await this.apiCall(deviceSetParamUrl(deviceId), body);

        console.log(data);
    }

    async tiltSensorBypass(deviceId: string) {
        /**
         * Tilt sensor bypass
         */
        const body = { type: "tilt_bpass", tilt_bpass: 1 };
        const data = await this.apiCall(deviceSetParamUrl(deviceId), body);

        console.log(data);
    }

    async additionalSensorBypass(deviceId: string) {
        /**
         * Additional sensor bypass
         */
        const body = { type: "add_sens_bpass", add_sens_bpass: 1 };
        const data = await this.apiCall(deviceSetParamUrl(deviceId), body);

        console.log(data);
    }

    async serviceModeEnable(deviceId: string) {
        /**
         * Service mode enable
         */
        const body = { type: "valet", valet: 1 };
        const data = await this.apiCall(deviceSetParamUrl(deviceId), body);

        console.log(data);
    }

    async serviceModeDisable(deviceId: string) {
        /**
         * Service mode disable
         */
        const body = { type: "valet", valet: 0 };
        const data = await this.apiCall(deviceSetParamUrl(deviceId), body);

        console.log(data);
    }

    async handsFreeModeEnable(deviceId: string) {
        /**
         * Hands free mode enable
         */
        const body = { type: "hfree", hfree: 1 };
        const data = await this.apiCall(deviceSetParamUrl(deviceId), body);

        console.log(data);
    }

    async handsFreeModeDisable(deviceId: string) {
        /**
         * Hands free mode disable
         */
        const body = { type: "hfree", hfree: 0 };
        const data = await this.apiCall(deviceSetParamUrl(deviceId), body);

        console.log(data);
    }

    async horn(deviceId: string) {
        /**
         * Horn
         */
        const body = { type: "poke", poke: 1 };
        const data = await this.apiCall(deviceSetParamUrl(deviceId), body);

        console.log(data);
    }

    async disarmTrunk(deviceId: string) {
        /**
         * Disarm trunk
         */
        const body = { type: "disarm_trunk", disarm_trunk: 1 };
        const data = await this.apiCall(deviceSetParamUrl(deviceId), body);

        console.log(data);
    }

    async panic(deviceId: string) {
        /**
         * Panic
         */
        const body = { type: "panic", panic: 1 };
        const data = await this.apiCall(deviceSetParamUrl(deviceId), body);

        console.log(data);
    }

    async webastoOn(deviceId: string) {
        /**
         * Turn on Webasto
         */
        const body = { type: "webasto_on", webasto_on: 1 };
        const data = await this.apiCall(deviceSetParamUrl(deviceId), body);

        console.log(data);
    }

    async webastoOff(deviceId: string) {
        /**
         * Turn off Webasto
         */
        const body = { type: "webasto_off", webasto_off: 1 };
        const data = await this.apiCall(deviceSetParamUrl(deviceId), body);

        console.log(data);
    }
}

export default StarLine;
