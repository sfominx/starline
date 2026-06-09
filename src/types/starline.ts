import { Item } from "./devices";

export type StarLineApiResponse = {
    code: number;
    codestring: string;
};

export type ControlDescription = {
    title?: string;
};

export type ControlsLibraryResponse = StarLineApiResponse & {
    controls: Record<string, ControlDescription>;
};

export type DeviceStateResponse = StarLineApiResponse & {
    state: Pick<Item, "car_state" | "car_alr_state" | "balance"> & {
        position?: {
            x?: number | string;
            y?: number | string;
            ts?: number | string;
            r?: number | string;
        };
        battery?: number | string;
        ctemp?: number;
        etemp?: number;
        gps_lvl?: number;
        gsm_lvl?: number;
        mayak_temp?: number;
        mon_type?: number | string;
        status?: number | string;
        ts_activity?: number | string;
        interval?: number;
    };
};

export type DevicePositionResponse = StarLineApiResponse & {
    device: {
        position: {
            lat?: string;
            lon?: string;
            ts?: string;
            pres?: string;
        };
    };
};

export type DeviceEvent = {
    timestamp: number;
    groupId: number;
    type: number;
};

export type DeviceEventsResponse = StarLineApiResponse & {
    events: DeviceEvent[];
};

export type ObdParamsResponse = StarLineApiResponse & {
    requirements?: {
        min_version?: string;
    };
    obd_params?: {
        fuel?: {
            val?: number;
            type?: "percents" | "liters" | "unknown";
            ts?: number;
        };
        errors?: {
            val?: number;
            ts?: number;
        };
        mileage?: {
            val?: number;
            ts?: number;
        };
    };
};

export type ObdErrorsResponse = StarLineApiResponse & {
    obd_errors: Array<{
        error?: string;
        error_ts?: number;
        descriptions?: {
            ru?: string;
            en?: string;
        };
        warning_level?: number;
    }>;
};

export type AsyncCommandStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type AsyncCommandResponse = StarLineApiResponse & {
    cmd_id?: string;
    type?: string;
    value?: number;
    status: AsyncCommandStatus;
    device_id?: string;
    time_start?: number;
    time_stop?: number;
    now?: number;
};

export type DeviceSettingsResponse = StarLineApiResponse & {
    device_id: string;
    general?: {
        tel?: string;
        name?: string;
        imei?: string;
        fw_version?: string;
    };
    webasto?: Record<string, unknown>;
    monitoring?: Record<string, unknown>;
    shock_sens?: Record<string, unknown>;
    remote_start?: Record<string, unknown>;
};
