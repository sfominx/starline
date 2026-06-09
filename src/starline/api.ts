import { LocalStorage } from "@raycast/api";
import { DEVELOPER_STARLINE, LOCAL_STORAGE } from "./constants";
import { StarLineClient } from "./client";
import { CarStatus, Devices } from "../types/devices";

function deviceSetParamUrl(deviceId: string) {
    return `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/set_param`;
}

type StarLineCommandValue = string | number | boolean;

type StarLineCommandBody = Record<string, unknown> & {
    type: string;
};

export class StarLine extends StarLineClient {
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
        return this.request<T>(deviceSetParamUrl(deviceId), "post", this.commandBody(type, value));
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
        return this.sendCommand(deviceId, "ign_start");
    }

    async stopEngine(deviceId: string) {
        return this.sendCommand(deviceId, "ign_stop");
    }

    async engineOn(deviceId: string) {
        return this.sendCommand(deviceId, "ign", 1);
    }

    async engineOff(deviceId: string) {
        return this.sendCommand(deviceId, "ign", 0);
    }

    async arm(deviceId: string): Promise<CarStatus> {
        return this.sendCommand<CarStatus>(deviceId, "arm_start");
    }

    async disarm(deviceId: string): Promise<CarStatus> {
        return this.sendCommand<CarStatus>(deviceId, "arm_stop");
    }

    async armQuietly(deviceId: string): Promise<CarStatus> {
        return this.sendCommand<CarStatus>(deviceId, "arm_quiet", 1);
    }

    async disarmQuietly(deviceId: string): Promise<CarStatus> {
        return this.sendCommand<CarStatus>(deviceId, "arm_quiet", 0);
    }

    async armStartQuietly(deviceId: string): Promise<CarStatus> {
        return this.sendCommand<CarStatus>(deviceId, "arm_start_quiet");
    }

    async armStopQuietly(deviceId: string): Promise<CarStatus> {
        return this.sendCommand<CarStatus>(deviceId, "arm_stop_quiet");
    }

    async shockSensorBypass(deviceId: string) {
        return this.sendCommand(deviceId, "shock_bpass");
    }

    async tiltSensorBypass(deviceId: string) {
        return this.sendCommand(deviceId, "tilt_bpass");
    }

    async additionalSensorBypass(deviceId: string) {
        return this.sendCommand(deviceId, "add_sens_bpass");
    }

    async serviceModeEnable(deviceId: string) {
        return this.sendCommand(deviceId, "valet", 1);
    }

    async serviceModeDisable(deviceId: string) {
        return this.sendCommand(deviceId, "valet", 0);
    }

    async handsFreeModeEnable(deviceId: string) {
        return this.sendCommand(deviceId, "hfree", 1);
    }

    async handsFreeModeDisable(deviceId: string) {
        return this.sendCommand(deviceId, "hfree", 0);
    }

    async horn(deviceId: string) {
        return this.sendCommand(deviceId, "poke");
    }

    async disarmTrunk(deviceId: string) {
        return this.sendCommand(deviceId, "disarm_trunk");
    }

    async panic(deviceId: string) {
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
        return this.sendCommand(deviceId, "webasto_on");
    }

    async webastoOff(deviceId: string) {
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
