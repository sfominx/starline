import { DEVELOPER_STARLINE } from "./constants";
import { StarLineSettingsApi } from "./settings";

export class StarLineUserApi extends StarLineSettingsApi {
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

    async getDeviceList<T = unknown>() {
        const { userId } = await this.auth();
        return this.request<T>(`${DEVELOPER_STARLINE}json/v1/user/${userId}/deviceList`);
    }
}
