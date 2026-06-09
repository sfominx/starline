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

const DEFAULT_POLL_INTERVAL_MS = 2_000;
const DEFAULT_COMMAND_TIMEOUT_MS = 30_000;

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
        case 0:
        case 1:
        case 2:
            return response.codestring;
    }
}

export class StarLineCommands extends StarLineClient {
    private commandBody(type: string, value: StarLineCommandValue = 1): StarLineCommandBody {
        return { type, [type]: value };
    }

    sendCommand<T = unknown>(deviceId: string, type: string, value: StarLineCommandValue = 1) {
        /**
         * Execute device command via legacy blocking /set_param endpoint.
         */
        return this.request<T>(deviceSetParamUrl(deviceId), {
            method: "post",
            body: this.commandBody(type, value),
        });
    }

    sendAsyncCommand<T = AsyncCommandResponse>(
        deviceId: string,
        type: string,
        value: StarLineCommandValue = 1,
    ) {
        /**
         * Execute device command via non-blocking /async endpoint.
         */
        const url = `${DEVELOPER_STARLINE}json/v2/device/${deviceId}/async`;
        return this.request<T>(url, { method: "post", body: { type, value } });
    }

    getAsyncCommandStatus<T = AsyncCommandResponse>(deviceId: string, commandId: string) {
        const url = `${DEVELOPER_STARLINE}json/v2/device/${deviceId}/async/${commandId}`;
        return this.request<T>(url);
    }

    async waitForAsyncCommand(
        deviceId: string,
        commandId: string,
        options: AsyncCommandOptions = {},
    ) {
        const intervalMs = options.intervalMs ?? DEFAULT_POLL_INTERVAL_MS;
        const timeoutMs = options.timeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS;
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
        value: StarLineCommandValue,
        options?: AsyncCommandOptions,
    ) {
        const response = await this.sendAsyncCommand(deviceId, type, value);

        if (response.status === 2) {
            return response;
        }

        if (response.status >= 3) {
            throw new Error(getAsyncCommandErrorMessage(response));
        }

        if (response.cmd_id === undefined || response.cmd_id.length === 0) {
            throw new Error("Async command response does not contain command id");
        }

        return this.waitForAsyncCommand(deviceId, response.cmd_id, options);
    }

    async sendCommandWithAsyncFallback<T = unknown>(
        deviceId: string,
        type: string,
        value: StarLineCommandValue,
        options?: AsyncCommandOptions,
    ) {
        try {
            return (await this.sendAsyncCommandAndWait(deviceId, type, value, options)) as T;
        } catch {
            return this.sendCommand<T>(deviceId, type, value);
        }
    }

    startEngine(deviceId: string) {
        return this.sendCommandWithAsyncFallback(deviceId, "ign_start", 1);
    }

    stopEngine(deviceId: string) {
        return this.sendCommandWithAsyncFallback(deviceId, "ign_stop", 1);
    }

    engineOn(deviceId: string) {
        return this.sendCommand(deviceId, "ign", 1);
    }

    engineOff(deviceId: string) {
        return this.sendCommand(deviceId, "ign", 0);
    }

    arm(deviceId: string): Promise<CarStatus> {
        return this.sendCommand<CarStatus>(deviceId, "arm_start");
    }

    disarm(deviceId: string): Promise<CarStatus> {
        return this.sendCommand<CarStatus>(deviceId, "arm_stop");
    }

    armQuietly(deviceId: string): Promise<CarStatus> {
        return this.sendCommand<CarStatus>(deviceId, "arm_quiet", 1);
    }

    disarmQuietly(deviceId: string): Promise<CarStatus> {
        return this.sendCommand<CarStatus>(deviceId, "arm_quiet", 0);
    }

    armStartQuietly(deviceId: string): Promise<CarStatus> {
        return this.sendCommand<CarStatus>(deviceId, "arm_start_quiet");
    }

    armStopQuietly(deviceId: string): Promise<CarStatus> {
        return this.sendCommand<CarStatus>(deviceId, "arm_stop_quiet");
    }

    shockSensorBypass(deviceId: string) {
        return this.sendCommand(deviceId, "shock_bpass");
    }

    tiltSensorBypass(deviceId: string) {
        return this.sendCommand(deviceId, "tilt_bpass");
    }

    additionalSensorBypass(deviceId: string) {
        return this.sendCommand(deviceId, "add_sens_bpass");
    }

    serviceModeEnable(deviceId: string) {
        return this.sendCommand(deviceId, "valet", 1);
    }

    serviceModeDisable(deviceId: string) {
        return this.sendCommand(deviceId, "valet", 0);
    }

    handsFreeModeEnable(deviceId: string) {
        return this.sendCommand(deviceId, "hfree", 1);
    }

    handsFreeModeDisable(deviceId: string) {
        return this.sendCommand(deviceId, "hfree", 0);
    }

    horn(deviceId: string) {
        return this.sendCommandWithAsyncFallback(deviceId, "poke", 1);
    }

    disarmTrunk(deviceId: string) {
        return this.sendCommand(deviceId, "disarm_trunk");
    }

    panic(deviceId: string) {
        return this.sendCommand(deviceId, "panic");
    }

    getBalance(deviceId: string, simNumber: 1 | 2 = 1) {
        return this.sendCommand(deviceId, "getbalance", simNumber);
    }

    updatePosition(deviceId: string) {
        return this.sendCommandWithAsyncFallback(deviceId, "update_position", 1);
    }

    outputOn(deviceId: string) {
        return this.sendCommand(deviceId, "out", 1);
    }

    outputOff(deviceId: string) {
        return this.sendCommand(deviceId, "out", 0);
    }

    dvrOn(deviceId: string) {
        return this.sendCommand(deviceId, "dvr", 1);
    }

    dvrOff(deviceId: string) {
        return this.sendCommand(deviceId, "dvr", 0);
    }

    webastoEnable(deviceId: string) {
        return this.sendCommand(deviceId, "webasto", 1);
    }

    webastoDisable(deviceId: string) {
        return this.sendCommand(deviceId, "webasto", 0);
    }

    webastoOn(deviceId: string) {
        return this.sendCommandWithAsyncFallback(deviceId, "webasto_on", 1);
    }

    webastoOff(deviceId: string) {
        return this.sendCommandWithAsyncFallback(deviceId, "webasto_off", 1);
    }

    flex(deviceId: string, number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) {
        return this.sendCommand(deviceId, `flex_${number}`);
    }
}
