import defaultDeviceCommand from "./utils/defaultDeviceCommand";

export default async function stopEngineCommand() {
    await defaultDeviceCommand({
        successMessage: "Engine stopped",
        run: (starline, deviceId) => starline.stopEngine(deviceId),
    });
}
