import defaultDeviceCommand from "./utils/defaultDeviceCommand";

export default async function hornCommand() {
    await defaultDeviceCommand({
        successMessage: "Horn command sent",
        run: (starline, deviceId) => starline.horn(deviceId),
    });
}
