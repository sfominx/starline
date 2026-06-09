import { LocalStorage } from "@raycast/api";
import { DEVELOPER_STARLINE, LOCAL_STORAGE } from "./constants";
import { StarLineCommands } from "./commands";
import { Devices } from "../types/devices";

export class StarLine extends StarLineCommands {
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
