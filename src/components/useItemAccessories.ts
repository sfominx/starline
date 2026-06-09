import { Color, Icon } from "@raycast/api";

// import { useMemo } from "react";
import type { Item } from "../types/devices";
import type { List } from "@raycast/api";

type ListItemAccessory = NonNullable<List.Item.Props["accessories"]>[number];

export default function useItemAccessories(item: Item) {
    try {
        const accessories: ListItemAccessory[] = [];

        if (item.default) {
            accessories.push({
                icon: { source: Icon.Star, tintColor: Color.Yellow },
                tooltip: "Default device",
            });
        }

        if (item.car_state.arm) {
            accessories.push({
                icon: { source: Icon.Lock, tintColor: Color.Green },
                tooltip: "Armed",
            });
        } else {
            accessories.push({
                icon: { source: Icon.LockUnlocked, tintColor: Color.Red },
                tooltip: "Disarmed",
            });
        }

        if (item.car_state.run) {
            accessories.push({
                icon: { source: Icon.Play },
                tooltip: "Engine running",
            });
        } else {
            accessories.push({
                icon: { source: Icon.Stop },
                tooltip: "Engine stopped",
            });
        }

        return accessories;
    } catch (error) {
        return [];
    }
}
