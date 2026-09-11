"use client";

import { useActionState, useCallback, useMemo, useState } from "react";
import type { Gallery, GalleryImage } from "@/lib/content";
import { saveGalleryAction, type ActionState } from "../../../actions";
import ImagePicker, { Thumb } from "../../../ImagePicker";
import { IconButton, Label, StatusBar, inputClass } from "../../../ui";

const initial: ActionState = {};

export default function GalleryEditor({ gallery }: { gallery: Gallery }) {
  const [title, setTitle] = useState(gallery.title);
  const [blurb, setBlurb] = useState(gallery.blurb);
  const [cover, setCover] = useState(gallery.cover);
  const [images, setImages] = useState<GalleryImage[]>(gallery.images);

  const [state, formAction, pending] = useActionState(
    saveGalleryAction,
    initial,
  );

  const payload = useMemo(
    () => JSON.stringify({ title, blurb, cover, images }),
    [title, blurb, cover, images],
  );

  const saved = useMemo(
    () =>
      JSON.stringify({
        title: gallery.title,
        blurb: gallery.blurb,
        cover: gallery.cover,
        images: gallery.images,
      }),
    [gallery],
  );

  const dirty = payload !== saved;

  const addImage = useCallback((src: string) => {
    setImages((list) => [...list, { src, alt: "" }]);
  }, []);

  const move = (index: number, delta: number) => {
    setImages((list) => {
      const target = index + delta;
      if (target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = (index: number) => {
    setImages((list) => {
      const next = list.filter((_, i) => i !== index);
      if (list[index].src === cover && next.length > 0) setCover(next[0].src);
      return next;
    });
  };

  const setAlt = (index: number, alt: string) => {
    setImages((list) =>
      list.map((img, i) => (i === index ? { ...img, alt } : img)),
    );
  };

  return (
    <form action={formAction}>
      <input type="hidden" name="slug" value={gallery.slug} />
      <input type="hidden" name="payload" value={payload} />

      <h1 className="mt-3 font-display text-3xl text-ink">{gallery.title}</h1>
      <p className="mt-1 text-xs text-neutral-400">/gallery/{gallery.slug}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <Label htmlFor="title">Title</Label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <Label htmlFor="blurb">Short description</Label>
          <textarea
            id="blurb"
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>
      </div>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-ink">
              Photos{" "}
              <span className="font-sans text-sm text-neutral-400">
                ({images.length})
              </span>
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              The first photo is used as the gallery cover unless you pick
              another one.
            </p>
          </div>
          <div className="w-full sm:w-72">
            <ImagePicker onUploaded={addImage} label="Add photo" compact />
          </div>
        </div>

        {images.length === 0 ? (
          <p className="mt-8 border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
            No photos yet — upload one above.
          </p>
        ) : (
          <ul className="mt-7 space-y-4">
            {images.map((image, index) => (
              <li
                key={`${image.src}-${index}`}
                className="flex flex-wrap items-start gap-5 border border-neutral-200 p-4"
              >
                <Thumb
                  src={image.src}
                  alt={image.alt || title}
                  className="h-28 w-24 shrink-0"
                />

                <div className="min-w-[220px] flex-1">
                  <Label htmlFor={`alt-${index}`}>
                    Caption / alt text (for SEO &amp; screen readers)
                  </Label>
                  <input
                    id={`alt-${index}`}
                    value={image.alt}
                    onChange={(e) => setAlt(index, e.target.value)}
                    placeholder={title}
                    className={inputClass}
                  />

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-neutral-600">
                      <input
                        type="radio"
                        name="cover"
                        checked={cover === image.src}
                        onChange={() => setCover(image.src)}
                      />
                      Use as cover
                    </label>
                    <span className="text-xs text-neutral-400">
                      {image.src}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
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
                    disabled={index === images.length - 1}
                  >
                    ↓
                  </IconButton>
                  <IconButton
                    label="Remove photo"
                    onClick={() => remove(index)}
                    danger
                  >
                    ×
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <StatusBar state={state} pending={pending} dirty={dirty} />
    </form>
  );
}
