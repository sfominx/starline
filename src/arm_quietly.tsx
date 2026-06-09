import defaultDeviceCommand from "./utils/defaultDeviceCommand";

export default async function armQuietlyCommand() {
    await defaultDeviceCommand({
        successMessage: "Armed quietly",
        run: (starline, deviceId) => starline.armQuietly(deviceId),
    });
}
