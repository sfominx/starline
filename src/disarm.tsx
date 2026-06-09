import defaultDeviceCommand from "./utils/defaultDeviceCommand";

export default async function disarmCommand() {
    await defaultDeviceCommand({
        successMessage: "Disarmed",
        run: (starline, deviceId) => starline.disarm(deviceId),
    });
}
