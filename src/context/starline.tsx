import { createContext, useContext, useEffect, useState } from "react";

import DevicesLoadingFallback from "../components/DevicesLoadingFallback";
import { StarLine } from "../starline/api";

import type { PropsWithChildren } from "react";

const StarLineContext = createContext<StarLine | null>(null);

type StarLineProviderProps = PropsWithChildren;

export function StarLineProvider(props: StarLineProviderProps) {
    const { children } = props;
    const [starline, setStarLine] = useState<StarLine>();

    useEffect(() => {
        void new StarLine().initialize().then(setStarLine).catch(undefined);
    }, []);

    if (starline === undefined) {
        return <DevicesLoadingFallback />;
    }

    return <StarLineContext.Provider value={starline}>{children}</StarLineContext.Provider>;
}

export const useStarLine = () => {
    const context = useContext(StarLineContext);
    if (context === null) {
        throw new Error("useStarLine must be used within a StarLineProvider");
    }

    return context;
};
