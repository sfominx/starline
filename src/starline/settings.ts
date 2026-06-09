import { DEVELOPER_STARLINE } from "./constants";
import { StarLineDeviceApi } from "./devices";

import type { DeviceSettingsResponse } from "../types/starline";

export class StarLineSettingsApi extends StarLineDeviceApi {
    putComfortOptions<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/put_comfort_options`,
            {
                method: "post",
                body,
            },
        );
    }

    getSupportedComfortOptions<T = unknown>(deviceId: string) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/supported_comfort_options`,
        );
    }

    updateWebastoSettings<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v1/device/${deviceId}/settings/webasto`, {
            method: "post",
            body,
        });
    }

    updateRemoteStartSettings<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v2/device/${deviceId}/settings/remote_start`,
            {
                method: "post",
                body,
            },
        );
    }

    updateShockSensorSettings<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/settings/shock_sens`,
            {
                method: "post",
                body,
            },
        );
    }

    updateMonitoringSettings<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/settings/monitoring`,
            {
                method: "post",
                body,
            },
        );
    }

    getSettings<T = DeviceSettingsResponse>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v4/device/${deviceId}/settings`);
    }
}
