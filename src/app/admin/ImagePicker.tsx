"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { uploadAction } from "./actions";
import {
  ACCEPT_ATTRIBUTE,
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  formatMb,
} from "@/lib/limits";

/**
 * Uploads a file and hands the resulting public path back to the parent.
 *
 * The server action is invoked imperatively rather than through a nested
 * <form>: these pickers sit inside the editor's own form, and nested forms are
 * invalid HTML — the browser would drop the inner one and the file input would
 * end up submitting the editor instead.
 */
export default function ImagePicker({
  onUploaded,
  label = "Upload image",
  compact = false,
}: {
  onUploaded: (src: string) => void;
  label?: string;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Checked here as well as on the server: a body larger than the Server
    // Action limit is rejected by the framework before our code runs, and the
    // browser shows a bare "a server error occurred" page instead of this
    // message.
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(
        `That photo is ${formatMb(file.size)}. The limit is ${formatMb(MAX_UPLOAD_BYTES)} — please pick a smaller one.`,
      );
      event.target.value = "";
      return;
    }

    if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      setError(
        file.type === "image/heic" || file.type === "image/heif"
          ? "iPhone HEIC photos are not supported. In Settings → Camera → Formats choose “Most Compatible”, or export the photo as JPEG."
          : `${file.type || "That file"} is not supported. Use JPG, PNG, WebP or AVIF.`,
      );
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadAction({}, formData);
      if (result.error || !result.src) {
        setError(result.error ?? "Upload failed.");
      } else {
        onUploaded(result.src);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  return (
    <div className={compact ? "" : "mt-3"}>
      {/* No `name`: this input must stay out of the surrounding form's payload. */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        onChange={handleChange}
        disabled={pending}
        aria-label={label}
        className="block w-full text-xs text-neutral-500 file:mr-3 file:cursor-pointer file:border file:border-neutral-300 file:bg-white file:px-3 file:py-1.5 file:text-xs file:uppercase file:tracking-widest file:text-neutral-600 hover:file:border-ink hover:file:text-ink disabled:opacity-50"
      />

      {pending ? (
        <p className="mt-2 text-xs text-neutral-500">Uploading…</p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Thumb({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden border border-neutral-200 bg-neutral-100 ${className}`}
    >
      <Image src={src} alt={alt} fill sizes="200px" className="object-cover" />
    </div>
  );
}
