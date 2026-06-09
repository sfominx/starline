import { LocalStorage } from "@raycast/api";

import { StarLineCommands } from "./commands";
import { API_VERSION, type ApiVersion, LOCAL_STORAGE } from "./constants";
import { deviceUrl, legacyDeviceUrl, userUrl } from "./urls";

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
    async getDevices(): Promise<{ result: Devices }> {
        const { userId } = await this.auth();
        const data = await this.request<Devices>(userUrl(API_VERSION.v2, userId, "user_info"));
        const defaultDeviceId = Number(await LocalStorage.getItem(LOCAL_STORAGE.DEFAULT_DEVICE));

        const devices = [...data.devices, ...(data.shared_devices ?? [])].map((device) => ({
            ...device,
            default: device.device_id === defaultDeviceId,
        }));

        return { result: { ...data, devices, shared_devices: [] } };
    }

    getControlsLibrary<T = ControlsLibraryResponse>(deviceId: string) {
        return this.request<T>(legacyDeviceUrl(deviceId, "ctrls_library"));
    }

    getDeviceInfo<T = unknown>(deviceId: string) {
        return this.getDevice<T>(API_VERSION.v1, deviceId, "info");
    }

    updateDeviceInfo<T = unknown>(deviceId: string, body: unknown) {
        return this.postDevice<T>(API_VERSION.v1, deviceId, "info", body);
    }

    getWays<T = unknown>(deviceId: string, body: unknown) {
        return this.postDevice<T>(API_VERSION.v1, deviceId, "ways", body);
    }

    updateControls<T = unknown>(deviceId: string, body: unknown) {
        return this.postDevice<T>(API_VERSION.v2, deviceId, "controls", body);
    }

    getObdParams<T = ObdParamsResponse>(deviceId: string) {
        return this.request<T>(legacyDeviceUrl(deviceId, "obd_params"));
    }

    getPosition<T = DevicePositionResponse>(deviceId: string) {
        return this.getDevice<T>(API_VERSION.v1, deviceId, "position");
    }

    getState<T = DeviceStateResponse>(deviceId: string) {
        return this.getDevice<T>(API_VERSION.v2, deviceId, "state");
    }

    getEvents<T = DeviceEventsResponse>(deviceId: string, body: unknown) {
        return this.postDevice<T>(API_VERSION.v2, deviceId, "events", body);
    }

    getObdErrors<T = ObdErrorsResponse>(deviceId: string) {
        return this.request<T>(legacyDeviceUrl(deviceId, "obd_errors"));
    }

    getDeviceData<T = unknown>(deviceId: string) {
        return this.getDevice<T>(API_VERSION.v3, deviceId, "data");
    }

    getDeviceReport<T = unknown>(deviceId: string) {
        return this.getDevice<T>(API_VERSION.v2, deviceId);
    }

    getDrivingScore<T = unknown>(deviceId: string, body: unknown) {
        return this.postDevice<T>(API_VERSION.v2, deviceId, "driving_score", body);
    }

    getDrivingScoreHistory<T = unknown>(deviceId: string, body: unknown) {
        return this.postDevice<T>(API_VERSION.v2, deviceId, "driving_score_history", body);
    }

    getObdData<T = unknown>(deviceId: string, body: unknown) {
        return this.postDevice<T>(API_VERSION.v1, deviceId, "getObdData", body);
    }

    getDetails<T = unknown>(deviceId: string, body: unknown) {
        return this.postDevice<T>(API_VERSION.v1, deviceId, "details", body);
    }

    private getDevice<T>(version: ApiVersion, deviceId: string, path?: string) {
        return this.request<T>(deviceUrl(version, deviceId, path));
    }

    private postDevice<T>(version: ApiVersion, deviceId: string, path: string, body: unknown) {
        return this.request<T>(deviceUrl(version, deviceId, path), { method: "post", body });
    }
}
