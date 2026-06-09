import { Color, Icon, List } from "@raycast/api";
import { useMemo } from "react";
import { Item } from "../types/devices";

type ListItemAccessory = NonNullable<List.Item.Props["accessories"]>[number];

export default function useItemAccessories(item: Item) {
    return useMemo(() => {
        try {
            const accessories: ListItemAccessory[] = [];

            if (item.default) {
                accessories.push({
                    icon: { source: Icon.Star, tintColor: Color.Yellow },
                    tooltip: "Default device",
                });
            }

            return accessories;
        } catch (error) {
            return [];
        }
    }, [item.type]);
}
