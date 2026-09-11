"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "../actions";

const initial: ActionState = {};

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-5">
      <form
        action={formAction}
        className="w-full max-w-sm border border-beige bg-white p-8"
      >
        <h1 className="font-display text-2xl text-ink">Admin</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Enter the password to manage gallery, team and testimonials.
        </p>

        <input type="hidden" name="next" value={next} />

        <label
          htmlFor="password"
          className="mt-7 block text-xs uppercase tracking-widest text-neutral-500"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className="mt-2 w-full border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-ink"
        />

        {state.error ? (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full bg-ink px-6 py-3 text-xs uppercase tracking-[0.2em] text-cream transition-colors hover:bg-graphite disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
