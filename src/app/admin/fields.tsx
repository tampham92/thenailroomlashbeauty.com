"use client";

import type { ReactNode } from "react";
import ImagePicker, { Thumb } from "./ImagePicker";
import { IconButton, Label, inputClass } from "./ui";

export function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8 border border-neutral-200 p-5 sm:p-6">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function SubHeading({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-xs uppercase tracking-widest text-neutral-500">
        {children}
      </h3>
      {action}
    </div>
  );
}

export function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-neutral-300 px-3 py-1.5 text-xs uppercase tracking-widest text-neutral-600 transition-colors hover:border-ink hover:text-ink"
    >
      {children}
    </button>
  );
}

export function RowControls({
  index,
  length,
  onMove,
  onRemove,
  vertical = false,
}: {
  index: number;
  length: number;
  onMove: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
  vertical?: boolean;
}) {
  return (
    <div className={`flex gap-2 ${vertical ? "flex-col" : ""}`}>
      <IconButton
        label="Move up"
        onClick={() => onMove(index, -1)}
        disabled={index === 0}
      >
        ↑
      </IconButton>
      <IconButton
        label="Move down"
        onClick={() => onMove(index, 1)}
        disabled={index === length - 1}
      >
        ↓
      </IconButton>
      <IconButton label="Remove" onClick={() => onRemove(index)} danger>
        ×
      </IconButton>
    </div>
  );
}

/** A single, always-present image (no add/remove — only replace). */
export function SingleImageField({
  label,
  src,
  onChange,
}: {
  label: string;
  src: string;
  onChange: (src: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-start gap-5">
      {src ? <Thumb src={src} alt={label} className="h-28 w-40" /> : null}
      <div className="min-w-[240px] flex-1">
        <Label>{label}</Label>
        <ImagePicker onUploaded={onChange} label={`Replace ${label}`} />
        <p className="mt-2 break-all text-xs text-neutral-400">{src}</p>
      </div>
    </div>
  );
}

/** An ordered list of images, optionally with an alt-text field each. */
export function ImageListField({
  images,
  onAdd,
  onMove,
  onRemove,
  onAlt,
  alts,
  emptyLabel = "No images yet.",
}: {
  images: string[];
  onAdd: (src: string) => void;
  onMove: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
  onAlt?: (index: number, alt: string) => void;
  alts?: string[];
  emptyLabel?: string;
}) {
  return (
    <>
      <div className="max-w-sm">
        <ImagePicker onUploaded={onAdd} label="Add image" compact />
      </div>

      {images.length === 0 ? (
        <p className="mt-5 border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
          {emptyLabel}
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {images.map((src, index) => (
            <li
              key={`${src}-${index}`}
              className="flex flex-wrap items-center gap-4 border border-neutral-200 p-3"
            >
              <Thumb src={src} alt={alts?.[index] ?? ""} className="h-20 w-20" />
              <div className="min-w-[200px] flex-1">
                {onAlt ? (
                  <>
                    <Label htmlFor={`alt-${index}-${src}`}>Alt text</Label>
                    <input
                      id={`alt-${index}-${src}`}
                      value={alts?.[index] ?? ""}
                      onChange={(e) => onAlt(index, e.target.value)}
                      className={inputClass}
                    />
                  </>
                ) : null}
                <p className="mt-2 break-all text-xs text-neutral-400">{src}</p>
              </div>
              <RowControls
                index={index}
                length={images.length}
                onMove={onMove}
                onRemove={onRemove}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** An ordered list of plain strings (bullet points, paragraphs). */
export function TextListField({
  values,
  onChange,
  onAdd,
  onMove,
  onRemove,
  multiline = false,
  addLabel = "+ Add item",
  placeholder,
}: {
  values: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onMove: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
  multiline?: boolean;
  addLabel?: string;
  placeholder?: string;
}) {
  return (
    <>
      <ul className="space-y-3">
        {values.map((value, index) => (
          <li key={index} className="flex items-start gap-3">
            {multiline ? (
              <textarea
                value={value}
                onChange={(e) => onChange(index, e.target.value)}
                rows={3}
                placeholder={placeholder}
                className={`${inputClass} mt-0`}
                aria-label={`Item ${index + 1}`}
              />
            ) : (
              <input
                value={value}
                onChange={(e) => onChange(index, e.target.value)}
                placeholder={placeholder}
                className={`${inputClass} mt-0`}
                aria-label={`Item ${index + 1}`}
              />
            )}
            <RowControls
              index={index}
              length={values.length}
              onMove={onMove}
              onRemove={onRemove}
            />
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <AddButton onClick={onAdd}>{addLabel}</AddButton>
      </div>
    </>
  );
}
