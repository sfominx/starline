import defaultDeviceCommand from "./utils/defaultDeviceCommand";

export default async function startEngineCommand() {
    await defaultDeviceCommand({
        successMessage: "Engine started",
        run: (starline, deviceId) => starline.startEngine(deviceId),
    });
}
