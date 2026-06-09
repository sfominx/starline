import React, {
    createContext,
    MutableRefObject,
    ReactNode,
    useContext,
    useMemo,
    useRef,
} from "react";
import { Item } from "../types/devices";
import { FailedToLoadDevicesItemsError } from "../utils/errors";

type ItemListener = (item: Item | FailedToLoadDevicesItemsError) => void;

type DevicesListenersContextType = {
    listeners: MutableRefObject<Map<string, ItemListener>>;
    subscribeItem: () => () => void;
    publishItems: (items: Item[] | FailedToLoadDevicesItemsError) => void;
};

const DevicesListenersContext = createContext<DevicesListenersContextType | null>(null);

function DevicesListenersProvider({ children }: { children: ReactNode }) {
    const listeners = useRef(new Map<string, ItemListener>());

    const publishItems = (itemsOrError: Item[] | FailedToLoadDevicesItemsError) => {
        if (itemsOrError instanceof FailedToLoadDevicesItemsError) {
            listeners.current.forEach((listener) => listener(itemsOrError));
        } else {
            listeners.current.forEach((listener, itemId) => {
                const item = itemsOrError.find((itm) => itm.device_id.toString() === itemId);
                if (item) listener(item);
            });
        }
    };

    const subscribeItem = (itemId: string, listener: ItemListener) => {
        listeners.current.set(itemId, listener);
        return () => {
            listeners.current.delete(itemId);
        };
    };

    const memoizedValue = useMemo(() => ({ listeners, publishItems, subscribeItem }), []);

    return (
        <DevicesListenersContext.Provider value={memoizedValue}>
            {children}
        </DevicesListenersContext.Provider>
    );
}

export const useDevicesItemPublisher = () => {
    const context = useContext(DevicesListenersContext);
    if (context == null) {
        throw new Error("useDevicesItemPublisher must be used within a DevicesListenersProvider");
    }

    return context.publishItems;
};

export default DevicesListenersProvider;
