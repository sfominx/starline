import { Action, Icon, Toast, showToast } from "@raycast/api";
import { useSelectedDeviceItem } from "../context/deviceItem";
import { StarLine } from "../../starline/api";
import { useDevicesContext } from "../../context/devices";

function ArmQuietlyAction() {
    const selectedItem = useSelectedDeviceItem();
    const { devices, updateState } = useDevicesContext();

    const handleAction = async () => {
        const starline = new StarLine();
        const data = await starline.armQuietly(selectedItem.device_id.toString());

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
        await showToast(Toast.Style.Success, "Armed quietly");
    };

    return <Action title="Arm Quietly" icon={Icon.Lock} onAction={handleAction} />;
}

export default ArmQuietlyAction;
