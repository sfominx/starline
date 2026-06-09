import { Toast, showToast } from "@raycast/api";
import { createContext, useContext, useReducer } from "react";

import {
    CaptchaNeededError,
    FailedToLoadDevicesItemsError,
    getDisplayableErrorMessage,
} from "../utils/errors";
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

export function DevicesProvider({ children }: { children: ReactNode }) {
    const starline = useStarLine();
    const [state, setState] = useReducer(
        (previous: DevicesState, next: Partial<DevicesState>) => ({ ...previous, ...next }),
        getInitialState(),
    );

    async function loadItems() {
        setState({ isLoading: true });

        try {
            const { result, error } = await starline.getDevices();

            if (error !== undefined) {
                throw new FailedToLoadDevicesItemsError(error);
            }

            setState({ devices: result?.devices ?? [], captchaNeeded: false });
        } catch (error) {
            if (error instanceof CaptchaNeededError) {
                setState({
                    captchaNeeded: true,
                    captchaImg: error.captchaImg,
                    captchaSid: error.captchaSid,
                });
                return;
            }

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
        setState({
            devices: state.devices.map((device) =>
                device.device_id === item.device_id ? { ...device, default: isDefault } : device,
            ),
        });
    }

    function updateState(next: SetStateAction<DevicesState>) {
        setState(typeof next === "function" ? next(state) : next);
    }

    useOnceEffect(() => {
        void loadItems();
    }, true);

    return (
        <DevicesContext.Provider
            value={{
                ...state,
                isEmpty: state.devices.length === 0,
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
