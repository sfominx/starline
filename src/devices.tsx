import { Action, ActionPanel, Form, List, showToast, Toast } from "@raycast/api";
import { DevicesProvider, useDevicesContext } from "./context/devices";
import { Item } from "./types/devices";
import DevicesItem from "./components/Item";
import { StarLineProvider, useStarLine } from "./context/starline";
import DevicesListenersProvider from "./context/devicesListeners";

function DevicesItemList({ devices }: { devices: Item[] }) {
    return (
        <>
            {devices.map((device) => (
                <DevicesItem key={device.device_id} item={device} />
            ))}
        </>
    );
}

function DeviceComponent() {
    const { devices, isLoading, captchaImg, captchaSid, loadItems, updateState } =
        useDevicesContext();
    const starline = useStarLine();

    if (captchaImg && captchaSid) {
        return (
            <Form
                actions={
                    <ActionPanel>
                        <Action.SubmitForm
                            title="Submit Captcha"
                            onSubmit={async (values: { captchaValue: string }) => {
                                try {
                                    await starline.loginWithCaptcha(
                                        captchaSid,
                                        values.captchaValue,
                                    );
                                    updateState((prev) => ({
                                        ...prev,
                                        captchaNeeded: false,
                                        captchaImg: undefined,
                                        captchaSid: undefined,
                                    }));
                                    await loadItems();
                                } catch (error) {
                                    await showToast(
                                        Toast.Style.Failure,
                                        "Captcha failed",
                                        error instanceof Error ? error.message : "Unknown error",
                                    );
                                }
                            }}
                        />
                        {captchaImg && (
                            <Action.OpenInBrowser
                                url={captchaImg}
                                shortcut={{ modifiers: ["cmd"], key: "." }}
                            />
                        )}
                    </ActionPanel>
                }
            >
                <Form.Description
                    title="Captcha needed"
                    text="Please view captcha from first url and enter the captcha to continue"
                />
                <Form.TextField id="captchaImg" title="URL" defaultValue={captchaImg} />
                <Form.TextField
                    id="captchaValue"
                    title="Captcha"
                    placeholder="Captcha value"
                    autoFocus
                />
            </Form>
        );
    }

    return (
        <List searchBarPlaceholder="Search device" isLoading={isLoading}>
            <DevicesItemList devices={devices} />
        </List>
    );
}

function DeviceCommand() {
    return (
        <StarLineProvider>
            <DevicesListenersProvider>
                <DevicesProvider>
                    <DeviceComponent />
                </DevicesProvider>
            </DevicesListenersProvider>
        </StarLineProvider>
    );
}

export default DeviceCommand;
