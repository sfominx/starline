import { useEffect, useRef } from "react";

import type { EffectCallback } from "react";

type AsyncEffectCallback = () => Promise<unknown>;
type Effect = EffectCallback | AsyncEffectCallback;

/** `useEffect` that only runs once after the `condition` is met */
function useOnceEffect(effect: Effect, condition = true) {
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) {
            return;
        }
        if (!condition) {
            return;
        }
        hasRun.current = true;
        void effect();
    }, [condition, effect]);
}

export default useOnceEffect;
