"use client";

import { useActionState, useMemo, useState } from "react";
import type { SiteFile } from "@/lib/site-shape";
import { saveSiteAction, type ActionState } from "../../actions";
import { Label, StatusBar, inputClass } from "../../ui";
import { Card } from "../../fields";

const initial: ActionState = {};

export default function SettingsEditor({ site }: { site: SiteFile }) {
  const [value, setValue] = useState<SiteFile>(site);
  const [state, formAction, pending] = useActionState(saveSiteAction, initial);

  const payload = useMemo(() => JSON.stringify(value), [value]);
  const dirty = payload !== useMemo(() => JSON.stringify(site), [site]);

  const set = (patch: Partial<SiteFile>) => setValue((v) => ({ ...v, ...patch }));
  const setAddress = (patch: Partial<SiteFile["address"]>) =>
    setValue((v) => ({ ...v, address: { ...v.address, ...patch } }));
  const setSocial = (patch: Partial<SiteFile["social"]>) =>
    setValue((v) => ({ ...v, social: { ...v.social, ...patch } }));

  const field = (
    id: string,
    label: string,
    current: string,
    onChange: (next: string) => void,
    opts: { placeholder?: string; multiline?: boolean; hint?: string } = {},
  ) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {opts.multiline ? (
        <textarea
          id={id}
          value={current}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={opts.placeholder}
          className={inputClass}
        />
      ) : (
        <input
          id={id}
          value={current}
          onChange={(e) => onChange(e.target.value)}
          placeholder={opts.placeholder}
          className={inputClass}
        />
      )}
      {opts.hint ? (
        <p className="mt-1.5 text-xs text-neutral-400">{opts.hint}</p>
      ) : null}
    </div>
  );

  const fullAddress = [
    value.address.street,
    value.address.city,
    [value.address.region, value.address.postalCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <form action={formAction}>
      <input type="hidden" name="payload" value={payload} />

      <h1 className="font-display text-3xl text-ink">Business details</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Used in the header, footer, contact page, page titles and search-engine
        data.
      </p>

      <Card title="Booking">
        {field(
          "bookingUrl",
          "Booking link",
          value.bookingUrl,
          (v) => set({ bookingUrl: v }),
          { hint: "Every “Book now” button on the site opens this URL." },
        )}
      </Card>

      <Card title="Contact">
        <div className="grid gap-5 sm:grid-cols-2">
          {field("phone", "Phone", value.phone, (v) => set({ phone: v }), {
            placeholder: "+1 (780) 695-3007",
            hint: `Call link: tel:${value.phone.replace(/[^\d+]/g, "")}`,
          })}
          {field("email", "Email", value.email, (v) => set({ email: v }))}
        </div>
      </Card>

      <Card title="Address">
        <div className="grid gap-5 sm:grid-cols-2">
          {field("street", "Street", value.address.street, (v) =>
            setAddress({ street: v }),
          )}
          {field("city", "City", value.address.city, (v) =>
            setAddress({ city: v }),
          )}
          {field("region", "Province / state", value.address.region, (v) =>
            setAddress({ region: v }),
          )}
          {field("postalCode", "Postal code", value.address.postalCode, (v) =>
            setAddress({ postalCode: v }),
          )}
          {field("country", "Country code", value.address.country, (v) =>
            setAddress({ country: v }),
          {
            placeholder: "CA",
          })}
          {field("mapUrl", "Google Maps link", value.address.mapUrl, (v) =>
            setAddress({ mapUrl: v }),
          )}
        </div>
        <p className="mt-5 text-sm text-neutral-500">
          Shown as: <span className="text-ink">{fullAddress}</span>
        </p>
      </Card>

      <Card title="Social">
        <div className="grid gap-5 sm:grid-cols-2">
          {field("facebook", "Facebook URL", value.social.facebook, (v) =>
            setSocial({ facebook: v }),
          )}
          {field("instagram", "Instagram URL", value.social.instagram, (v) =>
            setSocial({ instagram: v }),
          )}
        </div>
      </Card>

      <Card
        title="Naming & SEO"
        description="Shown in browser tabs, search results and link previews."
      >
        <div className="grid gap-5">
          {field("name", "Business name", value.name, (v) => set({ name: v }))}
          {field(
            "shortName",
            "Short name",
            value.shortName,
            (v) => set({ shortName: v }),
            { hint: "Appended to page titles, e.g. “Services | The Nail Room”." },
          )}
          {field(
            "description",
            "Meta description",
            value.description,
            (v) => set({ description: v }),
            { multiline: true },
          )}
        </div>
      </Card>

      <StatusBar state={state} pending={pending} dirty={dirty} />
    </form>
  );
}
