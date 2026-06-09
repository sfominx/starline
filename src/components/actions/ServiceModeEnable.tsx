import DeviceCommandAction from "./DeviceCommand";

function ServiceModeEnableAction() {
    return (
        <DeviceCommandAction
            title="Enable Service Mode"
            successMessage="Service mode enabled"
            run={(starline, deviceId) => starline.serviceModeEnable(deviceId)}
        />
    );
}

export default ServiceModeEnableAction;
