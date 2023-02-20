import { useLayoutEffect, useState } from "react";

export interface ISharedState<T> {
  state: T;
  useState(): [T, (v: T | ((v: T) => T)) => any];
}

export const makeSharedState = <T>(i: T | (() => T)) => {
  let state = i instanceof Function ? i() : i;
  const listeners = new Set<(v: T) => any>();

  const setSharedState = (v: T | ((v: T) => T)) => {
    state = v instanceof Function ? v(state) : v;
    for (const listener of listeners)
      listener(state);
  };

  const useSharedState = () => {
    const [, setLocalState] = useState(state);

    useLayoutEffect(() => {
      listeners.add(setLocalState);

      return () => {
        listeners.delete(setLocalState);
      };
    }, []);

    return [state, setSharedState] as [T, typeof setSharedState];
  };

  return {
    get state() { return state; },
    set state(v: T) { setSharedState(v); },
    useState() { return useSharedState(); }
  };
};