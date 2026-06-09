import { List } from "@raycast/api";

import DevicesItemContext from "./context/deviceItem";
import DevicesItemActionPanel from "./DeviceItemPanel";
import useItemAccessories from "./useItemAccessories";

import type { Item } from "../types/devices";

type DevicesItemProps = {
    item: Item;
};

function DevicesItem({ item }: DevicesItemProps) {
    const accessories = useItemAccessories(item);
    return (
        <DevicesItemContext.Provider value={item}>
            <List.Item
                id={item.device_id.toString()}
                title={item.alias || item.phone}
                subtitle={`${item.car_state.run ? "Engine started" : "Engine stopped"}, Inside temp: ${item.ctemp}°C / Engine temp: ${item.etemp}°C`}
                actions={<DevicesItemActionPanel />}
                accessories={accessories}
            />
        </DevicesItemContext.Provider>
    );
}

export default DevicesItem;
