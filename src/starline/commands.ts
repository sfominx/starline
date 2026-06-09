import { DEVELOPER_STARLINE } from "./constants";
import { StarLineClient } from "./client";
import { CarStatus } from "../types/devices";

function deviceSetParamUrl(deviceId: string) {
    return `${DEVELOPER_STARLINE}json/v1/device/${deviceId}/set_param`;
}

export type StarLineCommandValue = string | number | boolean;

type StarLineCommandBody = Record<string, unknown> & {
    type: string;
};

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

    async sendAsyncCommand<T = unknown>(
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

    async getAsyncCommandStatus<T = unknown>(deviceId: string, commandId: string) {
        const url = `${DEVELOPER_STARLINE}json/v2/device/${deviceId}/async/${commandId}`;
        return this.request<T>(url);
    }

    async startEngine(deviceId: string) {
        return this.sendCommand(deviceId, "ign_start");
    }

    async stopEngine(deviceId: string) {
        return this.sendCommand(deviceId, "ign_stop");
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
        return this.sendCommand(deviceId, "poke");
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
        return this.sendCommand(deviceId, "update_position");
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
        return this.sendCommand(deviceId, "webasto_on");
    }

    async webastoOff(deviceId: string) {
        return this.sendCommand(deviceId, "webasto_off");
    }

    async flex(deviceId: string, number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) {
        return this.sendCommand(deviceId, `flex_${number}`);
    }
}
