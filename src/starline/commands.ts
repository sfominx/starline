import { StarLineClient } from "./client";
import { DEVELOPER_STARLINE } from "./constants";

import type { CarStatus } from "../types/devices";
import type { AsyncCommandResponse } from "../types/starline";

function deviceSetParamUrl(deviceId: string) {
    return `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/set_param`;
}

export type StarLineCommandValue = string | number | boolean;

type StarLineCommandBody = Record<string, unknown> & {
    type: string;
};

type AsyncCommandOptions = {
    intervalMs?: number;
    timeoutMs?: number;
};

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function getAsyncCommandErrorMessage(response: AsyncCommandResponse) {
    switch (response.status) {
        case 3:
            return "Command failed on device";
        case 4:
            return "Device is offline";
        case 5:
            return "Device response timeout";
        case 6:
            return "Command status expired on server";
        default:
            return response.codestring || "Async command failed";
    }
}

export class StarLineCommands extends StarLineClient {
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

    async sendAsyncCommand<T = AsyncCommandResponse>(
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

    async getAsyncCommandStatus<T = AsyncCommandResponse>(deviceId: string, commandId: string) {
        const url = `${DEVELOPER_STARLINE}json/v2/device/${deviceId}/async/${commandId}`;
        return this.request<T>(url);
    }

    async waitForAsyncCommand(
        deviceId: string,
        commandId: string,
        options: AsyncCommandOptions = {},
    ) {
        const intervalMs = options.intervalMs ?? 2_000;
        const timeoutMs = options.timeoutMs ?? 30_000;
        const deadline = Date.now() + timeoutMs;

        while (Date.now() <= deadline) {
            const status = await this.getAsyncCommandStatus(deviceId, commandId);

            if (status.status === 2) {
                return status;
            }

            if (status.status >= 3) {
                throw new Error(getAsyncCommandErrorMessage(status));
            }

            await sleep(intervalMs);
        }

        throw new Error("Async command polling timeout");
    }

    async sendAsyncCommandAndWait(
        deviceId: string,
        type: string,
        value: StarLineCommandValue = 1,
        options?: AsyncCommandOptions,
    ) {
        const response = await this.sendAsyncCommand(deviceId, type, value);

        if (response.status === 2) {
            return response;
        }

        if (response.status >= 3) {
            throw new Error(getAsyncCommandErrorMessage(response));
        }

        if (!response.cmd_id) {
            throw new Error("Async command response does not contain command id");
        }

        return this.waitForAsyncCommand(deviceId, response.cmd_id, options);
    }

    async sendCommandWithAsyncFallback<T = unknown>(
        deviceId: string,
        type: string,
        value: StarLineCommandValue = 1,
        options?: AsyncCommandOptions,
    ) {
        try {
            return (await this.sendAsyncCommandAndWait(deviceId, type, value, options)) as T;
        } catch (error) {
            return this.sendCommand<T>(deviceId, type, value);
        }
    }

    async startEngine(deviceId: string) {
        return this.sendCommandWithAsyncFallback(deviceId, "ign_start");
    }

    async stopEngine(deviceId: string) {
        return this.sendCommandWithAsyncFallback(deviceId, "ign_stop");
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
        return this.sendCommandWithAsyncFallback(deviceId, "poke");
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
        return this.sendCommandWithAsyncFallback(deviceId, "update_position");
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
        return this.sendCommandWithAsyncFallback(deviceId, "webasto_on");
    }

    async webastoOff(deviceId: string) {
        return this.sendCommandWithAsyncFallback(deviceId, "webasto_off");
    }

    async flex(deviceId: string, number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) {
        return this.sendCommand(deviceId, `flex_${number}`);
    }
}
