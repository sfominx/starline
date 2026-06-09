import { LocalStorage } from "@raycast/api";

import { StarLineCommands } from "./commands";
import { DEVELOPER_STARLINE, LOCAL_STORAGE } from "./constants";

import type { Devices } from "../types/devices";
import type {
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

        const defaultDevice = Number(
            await LocalStorage.getItem<number>(LOCAL_STORAGE.DEFAULT_DEVICE),
        );

        data.devices.forEach((element, index) => {
            data.devices[index].default = element.device_id === defaultDevice;
        });

        return { result: data };
    }

    getControlsLibrary<T = ControlsLibraryResponse>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/device/${deviceId}/ctrls_library`);
    }

    getDeviceInfo<T = unknown>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v1/device/${deviceId}/info`);
    }

    updateDeviceInfo<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v1/device/${deviceId}/info`, {
            method: "post",
            body,
        });
    }

    getWays<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v1/device/${deviceId}/ways`, {
            method: "post",
            body,
        });
    }

    updateControls<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v2/device/${deviceId}/controls`, {
            method: "post",
            body,
        });
    }

    getObdParams<T = ObdParamsResponse>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/device/${deviceId}/obd_params`);
    }

    getPosition<T = DevicePositionResponse>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v1/device/${deviceId}/position`);
    }

    getState<T = DeviceStateResponse>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v2/device/${deviceId}/state`);
    }

    getEvents<T = DeviceEventsResponse>(deviceId: string, body: unknown) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v2/device/${deviceId}/events`, {
            method: "post",
            body,
        });
    }

    getEventDescription<T = unknown>(eventId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v3/library/events/${eventId}`);
    }

    getEventsLibrary<T = unknown>() {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v3/library/events`);
    }

    getObdErrors<T = ObdErrorsResponse>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/device/${deviceId}/obd_errors`);
    }

    getDeviceData<T = unknown>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v3/device/${deviceId}/data`);
    }

    getDeviceReport<T = unknown>(deviceId: string) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v2/device/${deviceId}`);
    }

    getDrivingScore<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v2/device/${deviceId}/driving_score`, {
            method: "post",
            body,
        });
    }

    getDrivingScoreHistory<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(
            `${DEVELOPER_STARLINE}json/v2/device/${deviceId}/driving_score_history`,
            {
                method: "post",
                body,
            },
        );
    }

    getObdData<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v1/device/${deviceId}/getObdData`, {
            method: "post",
            body,
        });
    }

    getDetails<T = unknown>(deviceId: string, body: unknown) {
        return this.request<T>(`${DEVELOPER_STARLINE}json/v1/device/${deviceId}/details`, {
            method: "post",
            body,
        });
    }
}
