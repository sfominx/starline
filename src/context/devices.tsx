import React, { ReactNode, createContext, useContext, useMemo, useReducer } from "react";
import { LocalStorage, Toast, showToast } from "@raycast/api";
import { Devices, Item } from "../types/devices";
import useOnceEffect from "../utils/hooks/useOnceEffect";
import { useStarLine } from "./starline";
import { FailedToLoadDevicesItemsError, getDisplayableErrorMessage } from "../utils/errors";
import { useDevicesItemPublisher } from "./devicesListeners";
import { LOCAL_STORAGE } from "../starline/constants";

type DevicesState = Devices & {
    isLoading: boolean;
    captchaNeeded: boolean;
    captchaSid?: string;
    captchaImg?: string;
};

type DevicesContextType = DevicesState & {
    isEmpty: boolean;
    loadItems: () => Promise<void>;
    updateState: () => void;
};

type DevicesProviderProps = {
    children: ReactNode;
};
function getInitialState(): DevicesState {
    return {
        devices: [],
        isLoading: true,
        captchaNeeded: false,
        shared_devices: [],
        code: 200,
        codestring: "",
    };
}

const DevicesContext = createContext<DevicesContextType | null>(null);

export function DevicesProvider(props: DevicesProviderProps) {
    const { children } = props;
    const starline = useStarLine();
    const publishItems = useDevicesItemPublisher();

    const [state, setState] = useReducer(
        (previous: DevicesState, next: Partial<DevicesState>) => ({ ...previous, ...next }),
        { ...getInitialState(), ...{} },
    );

    async function loadItems() {
        try {
            setState({ isLoading: true });

            let devices: Item[] = [];

            try {
                const [itemsResult] = await Promise.all([starline.getDevices()]);
                if (itemsResult.error) throw itemsResult.error;
                if (itemsResult.result) {
                    console.log(JSON.stringify(itemsResult.result.devices[0].controls, null, "  "));
                    devices = itemsResult.result.devices;
                }
            } catch (error) {
                if (error instanceof Error && error.name === "CaptchaNeededError") {
                    setState({
                        captchaNeeded: true,
                        isLoading: false,
                        captchaImg: await LocalStorage.getItem<string>(LOCAL_STORAGE.CAPTCHA_IMG),
                        captchaSid: await LocalStorage.getItem<string>(LOCAL_STORAGE.CAPTCHA_SID),
                    });
                    return;
                }
                publishItems(new FailedToLoadDevicesItemsError());
                throw error;
            }

            setState({ devices });
            publishItems(devices);
        } catch (error) {
            await showToast(
                Toast.Style.Failure,
                "Failed to load devices items",
                getDisplayableErrorMessage(error),
            );
        } finally {
            setState({ isLoading: false });
        }
    }

    function updateState(next: React.SetStateAction<DevicesState>) {
        const newState = typeof next === "function" ? next(state) : next;
        setState(newState);
    }

    useOnceEffect(() => {
        void loadItems();
    }, true);

    const memoizedValue: DevicesContextType = useMemo(
        () => ({
            ...state,
            devices: state.devices,
            isEmpty: state.devices.length === 0,
            isLoading: state.isLoading,
            loadItems,
            updateState,
        }),
        [state, loadItems, updateState],
    );

    return <DevicesContext.Provider value={memoizedValue}>{children}</DevicesContext.Provider>;
}

export const useDevicesContext = () => {
    const context = useContext(DevicesContext);
    if (context == null) {
        throw new Error("useDevices must be used within a DevicesProvider");
    }

    return context;
};
