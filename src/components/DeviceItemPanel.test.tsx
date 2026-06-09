import React from "react";
import { create } from "react-test-renderer";

import DevicesItemContext from "./context/deviceItem";
import DevicesItemActionPanel from "./DeviceItemPanel";

import type { Item } from "../types/devices";

const item: Item = {
    object: "item",
    default: false,
    device_id: 1,
    alias: "Test Car",
    imei: "",
    sn: "",
    phone: "",
    battery: "",
    ctemp: 0,
    etemp: 0,
    fw_version: "",
    gsm_lvl: "",
    mon_type: "",
    status: "",
    ts_activity: "",
    type: "",
    typename: "",
    mayak_temp: "",
    position: {
        x: "",
        y: "",
        ts: "",
        r: "",
    },
    reg_date: "",
    balance: {
        active: {
            value: "",
            currency: "",
            operator: "",
            ts: "",
            state: "",
        },
    },
    car_alr_state: {
        door: false,
        hbrake: false,
        hood: false,
        ign: false,
        pbrake: false,
        shock_h: false,
        shock_l: false,
        tilt: false,
        trunk: false,
    },
    car_state: {
        alarm: false,
        out: false,
        arm: false,
        door: false,
        hbrake: false,
        hijack: false,
        hood: false,
        ign: false,
        r_start: false,
        run: false,
        trunk: false,
        valet: false,
        webasto: false,
        tilt_bpass: false,
        shock_bpass: false,
        add_sens_bpass: false,
        dvr: false,
    },
    functions: ["hfree"],
    controls: [{ position: 1, type: "hfree" }],
};

describe("DevicesItemActionPanel", () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation((message?: unknown) => {
            if (
                typeof message === "string" &&
                message.includes("react-test-renderer is deprecated")
            ) {
                return;
            }
            process.stderr.write(`${String(message)}\n`);
        });
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it("renders outside DevicesProvider", () => {
        expect(() =>
            create(
                <DevicesItemContext.Provider value={item}>
                    <DevicesItemActionPanel />
                </DevicesItemContext.Provider>,
            ),
        ).not.toThrow();
    });
});
