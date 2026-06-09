import React from "react";
import { Action, Icon, LocalStorage, Toast, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { LOCAL_STORAGE } from "../../starline/constants";
import { useDevicesContext } from "../../context/devices";
import { useDevicesItemPublisher } from "../../context/devicesListeners";

function SetAsDefaultDeviceAction() {
    const selectedItem = useSelectedDeviceItem();
    const { devices } = useDevicesContext();
    const publishItems = useDevicesItemPublisher();

    const handleAction = async () => {
        await LocalStorage.setItem(LOCAL_STORAGE.DEFAULT_DEVICE, selectedItem.device_id.toString());

        devices.forEach((element, index) => {
            if (element.device_id === selectedItem.device_id) {
                devices[index].default = true;
            }
        });

        publishItems(devices);

        await showToast(Toast.Style.Success, `Device "${selectedItem.alias}" set as default`);
    };

    return <Action title="Set as Default Device" icon={Icon.Star} onAction={handleAction} />;
}

export default SetAsDefaultDeviceAction;
