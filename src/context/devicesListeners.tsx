import React, { createContext, useContext, useRef } from "react";

import { FailedToLoadDevicesItemsError } from "../utils/errors";

import type { Item } from "../types/devices";
import type { MutableRefObject, ReactNode } from "react";

type ItemListener = (item: Item | FailedToLoadDevicesItemsError) => void;

type DevicesListenersContextType = {
    listeners: MutableRefObject<Map<string, ItemListener>>;
    subscribeItem: (itemId: string, listener: ItemListener) => () => void;
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
                if (item !== undefined) {
                    listener(item);
                }
            });
        }
    };

    const subscribeItem = (itemId: string, listener: ItemListener) => {
        listeners.current.set(itemId, listener);
        return () => {
            listeners.current.delete(itemId);
        };
    };

    // const memoizedValue = useMemo(() => ({ listeners, publishItems, subscribeItem }), []);

    return (
        <DevicesListenersContext.Provider value={{ listeners, publishItems, subscribeItem }}>
            {children}
        </DevicesListenersContext.Provider>
    );
}

export const useDevicesItemPublisher = () => {
    const context = useContext(DevicesListenersContext);
    if (context === null) {
        throw new Error("useDevicesItemPublisher must be used within a DevicesListenersProvider");
    }

    return context.publishItems;
};

/** Allows you to subscribe to a specific item and get notified when it changes. */
export const useDevicesItemSubscriber = () => {
    const context = useContext(DevicesListenersContext);
    if (context === null) {
        throw new Error("useDevicesItemSubscriber must be used within a DevicesListenersProvider");
    }

    return (itemId: string) => {
        let timeoutId: NodeJS.Timeout;

        return new Promise<Item>((resolve, reject) => {
            const unsubscribe = context.subscribeItem(itemId, (itemOrError) => {
                try {
                    unsubscribe();
                    if (itemOrError instanceof FailedToLoadDevicesItemsError) {
                        throw itemOrError;
                    }
                    resolve(itemOrError);
                    clearTimeout(timeoutId);
                } catch (error) {
                    reject(error instanceof Error ? error : new Error(String(error)));
                }
            });

            timeoutId = setTimeout(() => {
                unsubscribe();
                reject(new SubscriberTimeoutError());
            }, 15000);
        });
    };
};

class SubscriberTimeoutError extends Error {
    constructor() {
        super("Timed out waiting for item");
        this.name = "SubscriberTimeoutError";
    }
}

export default DevicesListenersProvider;
