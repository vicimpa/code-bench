import { useLayoutEffect } from "react";

import { useRerender } from "./rerender";

export class StatedMap<K, V> extends Map<K, V> {
  #listeners = new Set<() => void>();

  update() {
    for (const listener of this.#listeners)
      listener();
  }

  set(key: K, value: V): this {
    super.set(key, value);
    this.update();
    return this;
  }

  delete(key: K): boolean {
    const result = super.delete(key);
    this.update();
    return result;
  }

  clear(): void {
    super.clear();
    this.update();
  }

  use() {
    const rerender = useRerender();

    useLayoutEffect(() => {
      this.#listeners.add(rerender);

      return () => {
        this.#listeners.delete(rerender);
      };
    }, []);

    return this;
  }
}