import defaultDeviceCommand from "./utils/defaultDeviceCommand";

export default async function disarmQuietlyCommand() {
    await defaultDeviceCommand({
        successMessage: "Disarmed quietly",
        run: (starline, deviceId) => starline.disarmQuietly(deviceId),
    });
}
