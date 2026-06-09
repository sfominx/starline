import { LocalStorage, Toast, showToast } from "@raycast/api";
import { createContext, useContext, useReducer } from "react";

import { LOCAL_STORAGE } from "../starline/constants";
import { FailedToLoadDevicesItemsError, getDisplayableErrorMessage } from "../utils/errors";
import useOnceEffect from "../utils/hooks/useOnceEffect";

import { useStarLine } from "./starline";

import type { Devices, Item } from "../types/devices";
import type { ReactNode, SetStateAction } from "react";

type DevicesState = Devices & {
    isLoading: boolean;
    captchaNeeded: boolean;
    captchaSid?: string;
    captchaImg?: string;
};

type DevicesContextType = DevicesState & {
    isEmpty: boolean;
    loadItems: () => Promise<void>;
    updateState: (next: SetStateAction<DevicesState>) => void;
    toggleDefault: (item: Item, isDefault: boolean) => void;
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
    const [state, setState] = useReducer(
        (previous: DevicesState, next: Partial<DevicesState>) => ({ ...previous, ...next }),
        getInitialState(),
    );

    async function loadItems() {
        try {
            setState({ isLoading: true });

            try {
                const itemsResult = await starline.getDevices();

                if (itemsResult.error !== undefined) {
                    throw new FailedToLoadDevicesItemsError(itemsResult.error);
                }

                setState({ devices: itemsResult.result?.devices ?? [] });
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
                throw error;
            }
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

    function toggleDefault(item: Item, isDefault: boolean) {
        const devices = state.devices.map((device) =>
            device.device_id === item.device_id ? { ...device, default: isDefault } : device,
        );

        setState({ devices });
    }

    function updateState(next: SetStateAction<DevicesState>) {
        const newState = typeof next === "function" ? next(state) : next;
        setState(newState);
    }

    useOnceEffect(() => {
        void loadItems();
    }, true);

    return (
        <DevicesContext.Provider
            value={{
                ...state,
                devices: state.devices,
                isEmpty: state.devices.length === 0,
                isLoading: state.isLoading,
                loadItems,
                updateState,
                toggleDefault,
            }}
        >
            {children}
        </DevicesContext.Provider>
    );
}

export const useOptionalDevicesContext = () => useContext(DevicesContext);

export const useDevicesContext = () => {
    const context = useOptionalDevicesContext();
    if (context === null) {
        throw new Error("useDevices must be used within a DevicesProvider");
    }

    return context;
};
