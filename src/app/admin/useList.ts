"use client";

import { useMemo, type Dispatch, type SetStateAction } from "react";

/**
 * Add / remove / reorder / patch helpers for a list held in component state.
 * The home editor alone drives nine of these, so they live in one place.
 */
export function useList<T>(
  value: T[],
  setValue: Dispatch<SetStateAction<T[]>>,
) {
  return useMemo(
    () => ({
      add: (item: T) => setValue((list) => [...list, item]),
      remove: (index: number) =>
        setValue((list) => list.filter((_, i) => i !== index)),
      move: (index: number, delta: number) =>
        setValue((list) => {
          const target = index + delta;
          if (target < 0 || target >= list.length) return list;
          const next = [...list];
          [next[index], next[target]] = [next[target], next[index]];
          return next;
        }),
      set: (index: number, item: T) =>
        setValue((list) => list.map((x, i) => (i === index ? item : x))),
      patch: (index: number, partial: Partial<T>) =>
        setValue((list) =>
          list.map((x, i) => (i === index ? { ...x, ...partial } : x)),
        ),
      length: value.length,
    }),
    [value.length, setValue],
  );
}
