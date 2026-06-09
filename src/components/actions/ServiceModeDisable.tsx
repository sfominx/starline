import DeviceCommandAction from "./DeviceCommand";

function ServiceModeDisableAction() {
    return (
        <DeviceCommandAction
            title="Disable Service Mode"
            successMessage="Service mode disabled"
            run={(starline, deviceId) => starline.serviceModeDisable(deviceId)}
        />
    );
}

export default ServiceModeDisableAction;
