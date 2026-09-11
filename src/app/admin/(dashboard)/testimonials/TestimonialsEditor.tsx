"use client";

import { useActionState, useMemo, useState } from "react";
import type { Testimonial } from "@/lib/content";
import { saveTestimonialsAction, type ActionState } from "../../actions";
import { IconButton, Label, StatusBar, inputClass } from "../../ui";

const initial: ActionState = {};

export default function TestimonialsEditor({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [items, setItems] = useState<Testimonial[]>(testimonials);
  const [state, formAction, pending] = useActionState(
    saveTestimonialsAction,
    initial,
  );

  const payload = useMemo(() => JSON.stringify(items), [items]);
  const saved = useMemo(() => JSON.stringify(testimonials), [testimonials]);
  const dirty = payload !== saved;

  const update = (index: number, patch: Partial<Testimonial>) => {
    setItems((list) =>
      list.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    );
  };

  const move = (index: number, delta: number) => {
    setItems((list) => {
      const target = index + delta;
      if (target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <form action={formAction}>
      <input type="hidden" name="payload" value={payload} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Testimonials</h1>
          <p className="mt-2 text-sm text-neutral-500">
            While this list is empty the page shows a “leave us a review” panel
            instead.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setItems((list) => [...list, { quote: "", author: "", source: "" }])
          }
          className="border border-neutral-300 px-4 py-2 text-xs uppercase tracking-widest text-neutral-600 transition-colors hover:border-ink hover:text-ink"
        >
          + Add testimonial
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-9 border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
          No testimonials yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-5">
          {items.map((item, index) => (
            <li key={index} className="border border-neutral-200 p-5">
              <div className="flex flex-wrap gap-5">
                <div className="min-w-[260px] flex-1 space-y-4">
                  <div>
                    <Label htmlFor={`quote-${index}`}>Quote</Label>
                    <textarea
                      id={`quote-${index}`}
                      value={item.quote}
                      onChange={(e) => update(index, { quote: e.target.value })}
                      rows={4}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`author-${index}`}>Client name</Label>
                      <input
                        id={`author-${index}`}
                        value={item.author}
                        onChange={(e) =>
                          update(index, { author: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`source-${index}`}>
                        Source (optional)
                      </Label>
                      <input
                        id={`source-${index}`}
                        value={item.source ?? ""}
                        onChange={(e) =>
                          update(index, { source: e.target.value })
                        }
                        placeholder="Google review"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-row gap-2 sm:flex-col">
                  <IconButton
                    label="Move up"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                  >
                    ↑
                  </IconButton>
                  <IconButton
                    label="Move down"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                  >
                    ↓
                  </IconButton>
                  <IconButton
                    label="Remove testimonial"
                    onClick={() =>
                      setItems((list) => list.filter((_, i) => i !== index))
                    }
                    danger
                  >
                    ×
                  </IconButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <StatusBar state={state} pending={pending} dirty={dirty} />
    </form>
  );
}
