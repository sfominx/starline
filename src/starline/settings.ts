import { DEVELOPER_STARLINE } from "./constants";
import { StarLineDeviceApi } from "./devices";

import type { DeviceSettingsResponse } from "../types/starline";

export class StarLineSettingsApi extends StarLineDeviceApi {
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

    async getSettings<T = DeviceSettingsResponse>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v4/device/${deviceId}/settings`);
    }
}
