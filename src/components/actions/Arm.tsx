import React from "react";
import { Action, Icon, Toast, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { StarLine } from "../../starline/api";
import { useOptionalDevicesContext } from "../../context/devices";

function ArmAction() {
    const selectedItem = useSelectedDeviceItem();
    const devicesContext = useOptionalDevicesContext();

    const handleAction = async () => {
        const starline = new StarLine();
        const data = await starline.arm(selectedItem.device_id.toString());

        if (devicesContext) {
            const devices = devicesContext.devices.map((device) => {
                if (device.device_id === selectedItem.device_id) {
                    return { ...device, car_state: { ...device.car_state, arm: data.arm === "1" } };
                }
                return device;
            });

            devicesContext.updateState({
                devices,
                isLoading: false,
                captchaNeeded: false,
            });
        }

        await showToast(Toast.Style.Success, "Armed");
    };

    return <Action title="Arm" icon={Icon.Lock} onAction={handleAction} />;
}

export default ArmAction;
