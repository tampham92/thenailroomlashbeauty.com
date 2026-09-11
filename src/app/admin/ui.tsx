"use client";

import type { ReactNode } from "react";
import type { ActionState } from "./actions";

export function Label({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs uppercase tracking-widest text-neutral-500"
    >
      {children}
    </label>
  );
}

export const inputClass =
  "mt-2 w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink";

export function IconButton({
  onClick,
  label,
  children,
  disabled,
  danger,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center border text-sm transition-colors disabled:opacity-30 ${
        danger
          ? "border-red-200 text-red-600 hover:border-red-500 hover:bg-red-50"
          : "border-neutral-300 text-neutral-600 hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function StatusBar({
  state,
  pending,
  dirty,
  label = "Save changes",
}: {
  state: ActionState;
  pending: boolean;
  dirty: boolean;
  label?: string;
}) {
  return (
    <div className="sticky bottom-0 z-20 -mx-5 mt-10 flex flex-wrap items-center gap-4 border-t border-neutral-200 bg-white/95 px-5 py-4 backdrop-blur">
      <button
        type="submit"
        disabled={pending || !dirty}
        className="bg-ink px-7 py-3 text-xs uppercase tracking-[0.2em] text-cream transition-colors hover:bg-graphite disabled:opacity-40"
      >
        {pending ? "Saving…" : label}
      </button>

      {dirty && !pending ? (
        <span className="text-sm text-amber-700">Unsaved changes</span>
      ) : null}

      {state.error ? (
        <span role="alert" className="text-sm text-red-700">
          {state.error}
        </span>
      ) : null}

      {state.ok && !dirty ? (
        <span role="status" className="text-sm text-green-700">
          {state.ok}
        </span>
      ) : null}
    </div>
  );
}
