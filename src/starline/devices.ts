import { LocalStorage } from "@raycast/api";
import { DEVELOPER_STARLINE, LOCAL_STORAGE } from "./constants";
import { StarLineCommands } from "./commands";
import { Devices } from "../types/devices";
import {
    ControlsLibraryResponse,
    DeviceEventsResponse,
    DevicePositionResponse,
    DeviceStateResponse,
    ObdErrorsResponse,
    ObdParamsResponse,
} from "../types/starline";

export class StarLineDeviceApi extends StarLineCommands {
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

    async getControlsLibrary<T = ControlsLibraryResponse>(deviceId: string) {
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

    async getObdParams<T = ObdParamsResponse>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/device/${deviceId}/obd_params`);
    }

    async getPosition<T = DevicePositionResponse>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v1/device/${deviceId}/position`);
    }

    async getState<T = DeviceStateResponse>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v2/device/${deviceId}/state`);
    }

    async getEvents<T = DeviceEventsResponse>(deviceId: string, body: unknown) {
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

    async getObdErrors<T = ObdErrorsResponse>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/device/${deviceId}/obd_errors`);
    }

    async getDeviceData<T = unknown>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v3/device/${deviceId}/data`);
    }

    async getDeviceReport<T = unknown>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v2/device/${deviceId}`);
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

    async getDetails<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/details`,
            "post",
            body,
        );
    }
}
