"use client";

import { useActionState, useMemo, useState } from "react";
import type { Testimonial } from "@/lib/content";
import { saveTestimonialsAction, type ActionState } from "../../actions";
import { IconButton, Label, StatusBar, inputClass } from "../../ui";

const initial: ActionState = {};

/**
 * One review per line: quote | author | rating | source
 * Rating and source are optional. A pipe inside the quote would break the
 * split, so only the first three separators are treated as field breaks.
 */
function parseBulk(text: string): Testimonial[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      const [quote, author, rating, source] = parts;
      const parsedRating = Number(rating);
      return {
        quote: quote ?? "",
        author: author ?? "",
        ...(Number.isFinite(parsedRating) &&
        parsedRating >= 1 &&
        parsedRating <= 5
          ? { rating: Math.round(parsedRating) }
          : {}),
        ...(source ? { source } : {}),
      };
    })
    .filter((t) => t.quote && t.author);
}

export default function TestimonialsEditor({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [items, setItems] = useState<Testimonial[]>(testimonials);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulk, setBulk] = useState("");
  const parsed = useMemo(() => parseBulk(bulk), [bulk]);
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
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setBulkOpen((v) => !v)}
            className="border border-neutral-300 px-4 py-2 text-xs uppercase tracking-widest text-neutral-600 transition-colors hover:border-ink hover:text-ink"
          >
            {bulkOpen ? "Close paste box" : "Paste several"}
          </button>
          <button
            type="button"
            onClick={() =>
              setItems((list) => [
                ...list,
                { quote: "", author: "", source: "", rating: 5 },
              ])
            }
            className="border border-neutral-300 px-4 py-2 text-xs uppercase tracking-widest text-neutral-600 transition-colors hover:border-ink hover:text-ink"
          >
            + Add testimonial
          </button>
        </div>
      </div>

      {bulkOpen ? (
        <div className="mt-6 border border-neutral-200 bg-neutral-50 p-5">
          <Label htmlFor="bulk">
            One review per line — quote | name | rating | source
          </Label>
          <textarea
            id="bulk"
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            rows={6}
            placeholder={
              "Ashley did an amazing job, my nails lasted three weeks. | Lan N. | 5 | Google\nLovely space and so relaxing. | Marie T. | 5 | Facebook"
            }
            className={`${inputClass} font-mono text-xs`}
          />
          <p className="mt-2 text-xs text-neutral-500">
            Rating and source are optional. Paste the real wording from Google
            or Facebook — invented reviews break Google&rsquo;s policy and can
            get the business listing penalised.
          </p>

          {parsed.length > 0 ? (
            <div className="mt-4 border border-neutral-200 bg-white p-4">
              <p className="text-xs uppercase tracking-widest text-neutral-500">
                {parsed.length} review(s) will be added
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-neutral-600">
                {parsed.slice(0, 5).map((t, i) => (
                  <li key={i}>
                    <span className="text-ink">{t.author}</span>
                    {t.rating ? ` · ${"★".repeat(t.rating)}` : ""}
                    {t.source ? ` · ${t.source}` : ""} — {t.quote.slice(0, 60)}
                    {t.quote.length > 60 ? "…" : ""}
                  </li>
                ))}
                {parsed.length > 5 ? (
                  <li className="text-neutral-400">
                    …and {parsed.length - 5} more
                  </li>
                ) : null}
              </ul>
            </div>
          ) : bulk.trim() ? (
            <p className="mt-4 text-xs text-red-700">
              Nothing parsed yet — each line needs at least a quote and a name,
              separated by |
            </p>
          ) : null}

          <button
            type="button"
            disabled={parsed.length === 0}
            onClick={() => {
              setItems((list) => [...list, ...parsed]);
              setBulk("");
              setBulkOpen(false);
            }}
            className="mt-4 bg-ink px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-cream transition-colors hover:bg-graphite disabled:opacity-40"
          >
            Add {parsed.length || ""} to the list
          </button>
        </div>
      ) : null}

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
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label htmlFor={`rating-${index}`}>Rating</Label>
                      <select
                        id={`rating-${index}`}
                        value={item.rating ?? ""}
                        onChange={(e) =>
                          update(index, {
                            rating: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        className={inputClass}
                      >
                        <option value="">No rating</option>
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {"★".repeat(n)} ({n})
                          </option>
                        ))}
                      </select>
                    </div>
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
                    <div>
                      <Label htmlFor={`date-${index}`}>Date (optional)</Label>
                      <input
                        id={`date-${index}`}
                        value={item.date ?? ""}
                        onChange={(e) => update(index, { date: e.target.value })}
                        placeholder="March 2026"
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
