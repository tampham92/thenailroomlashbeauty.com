"use client";

import { useActionState, useMemo, useState } from "react";
import type { PageBanner, ServiceCategory, ServiceItem } from "@/lib/content";
import type { Services } from "@/data/services";
import { saveServicesAction, type ActionState } from "../../actions";
import { useList } from "../../useList";
import { Label, StatusBar, inputClass } from "../../ui";
import { AddButton, BannerFields, Card, RowControls } from "../../fields";

const initial: ActionState = {};

const blankItem: ServiceItem = { name: "", price: "", body: [""] };

export default function ServicesEditor({ services }: { services: Services }) {
  const [banner, setBanner] = useState<PageBanner>(services.banner);
  const [categories, setCategories] = useState<ServiceCategory[]>(
    services.categories,
  );
  const [open, setOpen] = useState<string | null>(
    services.categories[0]?.id ?? null,
  );

  const [state, formAction, pending] = useActionState(
    saveServicesAction,
    initial,
  );
  const cats = useList(categories, setCategories);

  const payload = useMemo(
    () => JSON.stringify({ banner, categories }),
    [banner, categories],
  );
  const saved = useMemo(() => JSON.stringify(services), [services]);
  const dirty = payload !== saved;

  /** Replaces the item list of one category. */
  const setItems = (ci: number, items: ServiceItem[]) =>
    cats.patch(ci, { items });

  const itemOps = (ci: number) => ({
    add: () => setItems(ci, [...categories[ci].items, { ...blankItem }]),
    remove: (ii: number) =>
      setItems(
        ci,
        categories[ci].items.filter((_, i) => i !== ii),
      ),
    move: (ii: number, delta: number) => {
      const items = [...categories[ci].items];
      const target = ii + delta;
      if (target < 0 || target >= items.length) return;
      [items[ii], items[target]] = [items[target], items[ii]];
      setItems(ci, items);
    },
    patch: (ii: number, patch: Partial<ServiceItem>) =>
      setItems(
        ci,
        categories[ci].items.map((it, i) =>
          i === ii ? { ...it, ...patch } : it,
        ),
      ),
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="payload" value={payload} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Services & pricing</h1>
          <p className="mt-2 text-sm text-neutral-500">
            The full menu on the Services page. Prices are plain text, so “65+”
            and “New set 70+ / fill 65+” both work.
          </p>
        </div>
        <AddButton
          onClick={() =>
            cats.add({ id: "", title: "New category", items: [{ ...blankItem }] })
          }
        >
          + Add category
        </AddButton>
      </div>

      <Card title="Banner">
        <BannerFields
          value={banner}
          onChange={(patch) => setBanner((b) => ({ ...b, ...patch }))}
          idPrefix="services"
        />
      </Card>

      <div className="mt-8 space-y-4">
        {categories.map((category, ci) => {
          const ops = itemOps(ci);
          const isOpen = open === category.id || open === `#${ci}`;
          return (
            <section key={ci} className="border border-neutral-200">
              <div className="flex flex-wrap items-center gap-4 border-b border-neutral-200 p-4">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : category.id || `#${ci}`)}
                  aria-expanded={isOpen}
                  className="flex h-8 w-8 items-center justify-center border border-neutral-300 text-sm text-neutral-600 hover:border-ink hover:text-ink"
                >
                  {isOpen ? "−" : "+"}
                </button>

                <div className="min-w-[200px] flex-1">
                  <input
                    value={category.title}
                    onChange={(e) => cats.patch(ci, { title: e.target.value })}
                    aria-label={`Category ${ci + 1} title`}
                    className={`${inputClass} mt-0 font-display text-lg`}
                  />
                </div>

                <span className="text-xs uppercase tracking-widest text-neutral-400">
                  {category.items.length} services
                </span>

                <RowControls
                  index={ci}
                  length={categories.length}
                  onMove={cats.move}
                  onRemove={cats.remove}
                />
              </div>

              {isOpen ? (
                <div className="p-4">
                  <ul className="space-y-4">
                    {category.items.map((item, ii) => (
                      <li
                        key={ii}
                        className="flex flex-wrap items-start gap-4 border border-neutral-200 p-4"
                      >
                        <div className="min-w-[260px] flex-1 space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <Label htmlFor={`n-${ci}-${ii}`}>Name</Label>
                              <input
                                id={`n-${ci}-${ii}`}
                                value={item.name}
                                onChange={(e) =>
                                  ops.patch(ii, { name: e.target.value })
                                }
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`p-${ci}-${ii}`}>Price</Label>
                              <input
                                id={`p-${ci}-${ii}`}
                                value={item.price ?? ""}
                                onChange={(e) =>
                                  ops.patch(ii, { price: e.target.value })
                                }
                                placeholder="65+"
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`d-${ci}-${ii}`}>
                                Duration (optional)
                              </Label>
                              <input
                                id={`d-${ci}-${ii}`}
                                value={item.duration ?? ""}
                                onChange={(e) =>
                                  ops.patch(ii, { duration: e.target.value })
                                }
                                placeholder="~1 hr"
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`s-${ci}-${ii}`}>
                                Subtitle (optional)
                              </Label>
                              <input
                                id={`s-${ci}-${ii}`}
                                value={item.subtitle ?? ""}
                                onChange={(e) =>
                                  ops.patch(ii, { subtitle: e.target.value })
                                }
                                placeholder="(Builder in a Bottle)"
                                className={inputClass}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`h-${ci}-${ii}`}>
                              Tagline (optional, shown in italics)
                            </Label>
                            <input
                              id={`h-${ci}-${ii}`}
                              value={item.headline ?? ""}
                              onChange={(e) =>
                                ops.patch(ii, { headline: e.target.value })
                              }
                              placeholder="Durable Length & Sculpted Beauty"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`b-${ci}-${ii}`}>
                              Description — one paragraph per line break
                            </Label>
                            <textarea
                              id={`b-${ci}-${ii}`}
                              value={(item.body ?? []).join("\n\n")}
                              onChange={(e) =>
                                ops.patch(ii, {
                                  body: e.target.value.split(/\n\s*\n/),
                                })
                              }
                              rows={5}
                              className={inputClass}
                            />
                            <p className="mt-1.5 text-xs text-neutral-400">
                              Leave a blank line between paragraphs.
                            </p>
                          </div>
                        </div>

                        <RowControls
                          index={ii}
                          length={category.items.length}
                          onMove={ops.move}
                          onRemove={ops.remove}
                        />
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4">
                    <AddButton onClick={ops.add}>+ Add service</AddButton>
                  </div>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      <StatusBar state={state} pending={pending} dirty={dirty} />
    </form>
  );
}
