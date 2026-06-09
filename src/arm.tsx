import defaultDeviceCommand from "./utils/defaultDeviceCommand";

export default async function armCommand() {
    await defaultDeviceCommand({
        successMessage: "Armed",
        run: (starline, deviceId) => starline.arm(deviceId),
    });
}
