import { StarLineClient } from "./client";
import { API_VERSION } from "./constants";
import { deviceUrl } from "./urls";

import type { CarStatus } from "../types/devices";
import type { AsyncCommandResponse } from "../types/starline";

export type CommandValue = string | number | boolean;
type CommandBody = Record<string, unknown> & { type: string };
type AsyncCommandOptions = { intervalMs?: number; timeoutMs?: number };

const POLL_INTERVAL_MS = 2_000;
const COMMAND_TIMEOUT_MS = 30_000;
const DEFAULT_COMMAND_VALUE = 1;

const ASYNC_STATUS = {
    done: 2,
    failed: 3,
    offline: 4,
    deviceTimeout: 5,
    expired: 6,
} as const;

const ASYNC_ERRORS: Partial<Record<number, string>> = {
    [ASYNC_STATUS.failed]: "Command failed on device",
    [ASYNC_STATUS.offline]: "Device is offline",
    [ASYNC_STATUS.deviceTimeout]: "Device response timeout",
    [ASYNC_STATUS.expired]: "Command status expired on server",
};

const COMMAND_TYPES = {
    startEngine: "ign_start",
    stopEngine: "ign_stop",
    arm: "arm_start",
    disarm: "arm_stop",
    armQuietly: "arm_start_quiet",
    disarmQuietly: "arm_stop_quiet",
    shockSensorBypass: "shock_bpass",
    tiltSensorBypass: "tilt_bpass",
    additionalSensorBypass: "add_sens_bpass",
    serviceMode: "valet",
    horn: "poke",
    updatePosition: "update_position",
} as const;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const commandUrl = (deviceId: string) => deviceUrl(API_VERSION.v1, deviceId, "set_param");
const asyncCommandUrl = (deviceId: string, commandId?: string) =>
    deviceUrl(API_VERSION.v2, deviceId, ["async", commandId].filter(Boolean).join("/"));
const commandBody = (type: string, value: CommandValue = DEFAULT_COMMAND_VALUE): CommandBody => ({
    type,
    [type]: value,
});
const isDone = ({ status }: AsyncCommandResponse) => status === ASYNC_STATUS.done;
const isFailed = ({ status }: AsyncCommandResponse) => status >= ASYNC_STATUS.failed;
const asyncError = ({ status, codestring }: AsyncCommandResponse) =>
    ASYNC_ERRORS[status] ?? codestring;

class AsyncCommandError extends Error {}

export class StarLineCommands extends StarLineClient {
    sendCommand<T = unknown>(deviceId: string, type: string, value: CommandValue = 1) {
        return this.request<T>(commandUrl(deviceId), {
            method: "post",
            body: commandBody(type, value),
        });
    }

    sendAsyncCommand<T = AsyncCommandResponse>(
        deviceId: string,
        type: string,
        value: CommandValue = DEFAULT_COMMAND_VALUE,
    ) {
        return this.request<T>(asyncCommandUrl(deviceId), {
            method: "post",
            body: { type, value },
        });
    }

    getAsyncCommandStatus<T = AsyncCommandResponse>(deviceId: string, commandId: string) {
        return this.request<T>(asyncCommandUrl(deviceId, commandId));
    }

    async waitForAsyncCommand(
        deviceId: string,
        commandId: string,
        { intervalMs = POLL_INTERVAL_MS, timeoutMs = COMMAND_TIMEOUT_MS }: AsyncCommandOptions = {},
    ) {
        const deadline = Date.now() + timeoutMs;

        while (Date.now() <= deadline) {
            const status = await this.getAsyncCommandStatus(deviceId, commandId);
            if (isDone(status)) {
                return status;
            }
            if (isFailed(status)) {
                throw new AsyncCommandError(asyncError(status));
            }
            await sleep(intervalMs);
        }

        throw new AsyncCommandError("Async command polling timeout");
    }

    async sendAsyncCommandAndWait(
        deviceId: string,
        type: string,
        value: CommandValue,
        options?: AsyncCommandOptions,
    ) {
        const response = await this.sendAsyncCommand(deviceId, type, value);
        if (isDone(response)) {
            return response;
        }
        if (isFailed(response)) {
            throw new AsyncCommandError(asyncError(response));
        }
        if (response.cmd_id === undefined || response.cmd_id.length === 0) {
            throw new AsyncCommandError("Async command response does not contain command id");
        }

        return this.waitForAsyncCommand(deviceId, response.cmd_id, options);
    }

    async sendCommandWithAsyncFallback<T = unknown>(
        deviceId: string,
        type: string,
        value: CommandValue,
        options?: AsyncCommandOptions,
    ) {
        let response: AsyncCommandResponse;

        try {
            response = await this.sendAsyncCommand(deviceId, type, value);
        } catch {
            return this.sendCommand<T>(deviceId, type, value);
        }

        if (isDone(response)) {
            return response as T;
        }
        if (isFailed(response)) {
            throw new AsyncCommandError(asyncError(response));
        }
        if (response.cmd_id === undefined || response.cmd_id.length === 0) {
            throw new AsyncCommandError("Async command response does not contain command id");
        }

        return (await this.waitForAsyncCommand(deviceId, response.cmd_id, options)) as T;
    }

    startEngine(deviceId: string) {
        return this.asyncFallback(deviceId, COMMAND_TYPES.startEngine);
    }

    stopEngine(deviceId: string) {
        return this.asyncFallback(deviceId, COMMAND_TYPES.stopEngine);
    }

    arm(deviceId: string) {
        return this.carStatusCommand(deviceId, COMMAND_TYPES.arm);
    }

    disarm(deviceId: string) {
        return this.carStatusCommand(deviceId, COMMAND_TYPES.disarm);
    }

    armQuietly(deviceId: string) {
        return this.carStatusCommand(deviceId, COMMAND_TYPES.armQuietly, 1);
    }

    disarmQuietly(deviceId: string) {
        return this.carStatusCommand(deviceId, COMMAND_TYPES.disarmQuietly, 1);
    }

    shockSensorBypass(deviceId: string) {
        return this.sendCommand(deviceId, COMMAND_TYPES.shockSensorBypass);
    }

    tiltSensorBypass(deviceId: string) {
        return this.sendCommand(deviceId, COMMAND_TYPES.tiltSensorBypass);
    }

    additionalSensorBypass(deviceId: string) {
        return this.sendCommand(deviceId, COMMAND_TYPES.additionalSensorBypass);
    }

    serviceModeEnable(deviceId: string) {
        return this.setServiceMode(deviceId, true);
    }

    serviceModeDisable(deviceId: string) {
        return this.setServiceMode(deviceId, false);
    }

    horn(deviceId: string) {
        return this.asyncFallback(deviceId, COMMAND_TYPES.horn);
    }

    updatePosition(deviceId: string) {
        return this.asyncFallback(deviceId, COMMAND_TYPES.updatePosition);
    }

    private asyncFallback(deviceId: string, type: string) {
        return this.sendCommandWithAsyncFallback(deviceId, type, DEFAULT_COMMAND_VALUE);
    }

    private carStatusCommand(deviceId: string, type: string, value?: CommandValue) {
        return this.sendCommand<CarStatus>(deviceId, type, value);
    }

    private setServiceMode(deviceId: string, enabled: boolean) {
        return this.sendCommand(deviceId, COMMAND_TYPES.serviceMode, Number(enabled));
    }
}
