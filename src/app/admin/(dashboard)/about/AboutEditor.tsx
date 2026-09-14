"use client";

import { useActionState, useMemo, useState } from "react";
import type { AboutFile } from "@/lib/content";
import { saveAboutAction, type ActionState } from "../../actions";
import { useList } from "../../useList";
import { Label, StatusBar, inputClass } from "../../ui";
import { Card, SingleImageField, SubHeading, TextListField } from "../../fields";

const initial: ActionState = {};

export default function AboutEditor({ about }: { about: AboutFile }) {
  const [value, setValue] = useState<AboutFile>(about);
  const [state, formAction, pending] = useActionState(saveAboutAction, initial);

  const paragraphs = useList(value.paragraphs, (fn) =>
    setValue((v) => ({
      ...v,
      paragraphs: typeof fn === "function" ? fn(v.paragraphs) : fn,
    })),
  );

  const payload = useMemo(() => JSON.stringify(value), [value]);
  const saved = useMemo(() => JSON.stringify(about), [about]);
  const dirty = payload !== saved;

  const set = (patch: Partial<AboutFile>) =>
    setValue((v) => ({ ...v, ...patch }));

  return (
    <form action={formAction}>
      <input type="hidden" name="payload" value={payload} />

      <h1 className="font-display text-3xl text-ink">About page</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Shown at <span className="text-ink">/about-us</span>.
      </p>

      <Card title="Banner">
        <SingleImageField
          label="Banner image"
          src={value.heroImage}
          onChange={(src) => set({ heroImage: src })}
        />

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="eyebrow">Small line above the title</Label>
            <input
              id="eyebrow"
              value={value.eyebrow}
              onChange={(e) => set({ eyebrow: e.target.value })}
              placeholder="Sherwood Park, Alberta"
              className={inputClass}
            />
          </div>
          <div>
            <Label htmlFor="title">Page title</Label>
            <input
              id="title"
              value={value.title}
              onChange={(e) => set({ title: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </Card>

      <Card title="Text">
        <SubHeading>Paragraphs</SubHeading>
        <TextListField
          values={value.paragraphs}
          multiline
          onChange={(i, v) => paragraphs.set(i, v)}
          onAdd={() => paragraphs.add("")}
          onMove={paragraphs.move}
          onRemove={paragraphs.remove}
          addLabel="+ Add paragraph"
        />
      </Card>

      <Card title="Side photo">
        <SingleImageField
          label="Photo beside the text"
          src={value.sideImage}
          onChange={(src) => set({ sideImage: src })}
        />
        <div className="mt-6">
          <Label htmlFor="sideAlt">
            Alt text (for SEO &amp; screen readers)
          </Label>
          <input
            id="sideAlt"
            value={value.sideImageAlt}
            onChange={(e) => set({ sideImageAlt: e.target.value })}
            className={inputClass}
          />
        </div>
      </Card>

      <Card
        title="SEO"
        description="Shown in Google results and link previews."
      >
        <Label htmlFor="meta">Meta description</Label>
        <textarea
          id="meta"
          value={value.metaDescription}
          onChange={(e) => set({ metaDescription: e.target.value })}
          rows={3}
          className={inputClass}
        />
      </Card>

      <StatusBar state={state} pending={pending} dirty={dirty} />
    </form>
  );
}
