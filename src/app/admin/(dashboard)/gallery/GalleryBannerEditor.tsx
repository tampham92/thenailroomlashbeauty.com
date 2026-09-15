"use client";

import { useActionState, useMemo, useState } from "react";
import type { PageBanner } from "@/lib/content";
import { saveGalleryBannerAction, type ActionState } from "../../actions";
import { BannerFields, Card } from "../../fields";
import { StatusBar } from "../../ui";

const initial: ActionState = {};

export default function GalleryBannerEditor({
  banner,
}: {
  banner: PageBanner;
}) {
  const [value, setValue] = useState<PageBanner>(banner);
  const [state, formAction, pending] = useActionState(
    saveGalleryBannerAction,
    initial,
  );

  const payload = useMemo(() => JSON.stringify(value), [value]);
  const saved = useMemo(() => JSON.stringify(banner), [banner]);

  return (
    <form action={formAction}>
      <input type="hidden" name="payload" value={payload} />
      <Card title="Gallery banner">
        <BannerFields
          value={value}
          onChange={(patch) => setValue((v) => ({ ...v, ...patch }))}
          idPrefix="gallery"
        />
      </Card>
      <StatusBar
        state={state}
        pending={pending}
        dirty={payload !== saved}
        label="Save banner"
      />
    </form>
  );
}
