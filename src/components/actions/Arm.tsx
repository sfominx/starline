import React from "react";
import { Action, Icon, Toast, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { StarLine } from "../../starline/api";
import { useDevicesContext } from "../../context/devices";

function ArmAction() {
    const selectedItem = useSelectedDeviceItem();
    const { devices, updateState } = useDevicesContext();

    const handleAction = async () => {
        const starline = new StarLine();
        const data = await starline.arm(selectedItem.device_id.toString());

        devices.forEach((device) => {
            if (device.device_id === selectedItem.device_id) {
                device.car_state.arm = data.arm === "1";
            }
        });

        const stateUpdate = {
            devices,
            isLoading: false,
            captchaNeeded: false,
        };

        updateState(stateUpdate);

        await showToast(Toast.Style.Success, "Armed");
    };

    return <Action title="Arm" icon={Icon.Lock} onAction={handleAction} />;
}

export default ArmAction;
