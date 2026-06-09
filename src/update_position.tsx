import defaultDeviceCommand from "./utils/defaultDeviceCommand";

export default async function updatePositionCommand() {
    await defaultDeviceCommand({
        successMessage: "Position update requested",
        run: (starline, deviceId) => starline.updatePosition(deviceId),
    });
}
