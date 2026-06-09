import { EffectCallback, useEffect, useRef } from "react";

type AsyncEffectCallback = () => Promise<unknown>;
type Effect = EffectCallback | AsyncEffectCallback;

/** `useEffect` that only runs once after the `condition` is met */
function useOnceEffect(effect: Effect, condition?: unknown) {
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        if (!condition) return;
        hasRun.current = true;
        effect();
    }, [condition]);
}

export default useOnceEffect;
