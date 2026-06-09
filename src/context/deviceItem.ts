import { createContext } from "react";

import type { Item } from "../types/devices";

const DevicesItemContext = createContext<Item | null>(null);

export default DevicesItemContext;
