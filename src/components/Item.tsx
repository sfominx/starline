import React from "react";
import { Icon, List } from "@raycast/api";

import { Item } from "../types/devices";
import DevicesItemActionPanel from "./DeviceItemPanel";
import DevicesItemContext from "./context/deviceItem";
import useItemAccessories from "./useItemAccessories";

type DevicesItemProps = {
    item: Item;
    icon: Icon;
};

function DevicesItem({ item, icon }: DevicesItemProps) {
    const accessories = useItemAccessories(item);
    return (
        <DevicesItemContext.Provider value={item}>
            <List.Item
                id={item.device_id.toString()}
                title={item.alias || item.phone}
                icon={icon}
                subtitle={`${item.car_state.run ? "Engine started" : "Engine stopped"}, Inside temp: ${item.ctemp}°C / Engine temp: ${item.etemp}°C`}
                actions={<DevicesItemActionPanel />}
                accessories={accessories}
            />
        </DevicesItemContext.Provider>
    );
}

export default DevicesItem;
