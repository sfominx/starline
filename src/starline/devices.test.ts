import { LocalStorage } from "@raycast/api";

import { StarLineDeviceApi } from "./devices";

import type { Devices, Item } from "../types/devices";

const createDevice = (deviceId: number): Item =>
    ({
        device_id: deviceId,
        default: false,
    }) as Item;

class TestStarLineDeviceApi extends StarLineDeviceApi {
    constructor(private readonly response: Devices) {
        super();
    }

    protected auth() {
        return Promise.resolve({ userId: "1", slnetUserToken: "token" });
    }

    protected request<T>(): Promise<T> {
        return Promise.resolve(this.response as T);
    }
}

describe("StarLineDeviceApi", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("includes shared devices in the returned device list", async () => {
        jest.mocked(LocalStorage.getItem).mockResolvedValue("2");
        const api = new TestStarLineDeviceApi({
            devices: [createDevice(1)],
            shared_devices: [createDevice(2)],
        });

        const { result } = await api.getDevices();

        expect(result.devices).toEqual([
            expect.objectContaining({ device_id: 1, default: false }),
            expect.objectContaining({ device_id: 2, default: true }),
        ]);
        expect(result.shared_devices).toEqual([]);
    });
});
