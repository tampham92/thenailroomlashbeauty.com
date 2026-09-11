"use client";

import { useActionState, useMemo, useState } from "react";
import type { PolicyFile, PolicyItem } from "@/lib/content";
import { savePolicyAction, type ActionState } from "../../actions";
import { useList } from "../../useList";
import { Label, StatusBar, inputClass } from "../../ui";
import { AddButton, RowControls, SubHeading } from "../../fields";

const initial: ActionState = {};

export default function PolicyEditor({ policy }: { policy: PolicyFile }) {
  const [intro, setIntro] = useState(policy.intro);
  const [outro, setOutro] = useState(policy.outro);
  const [items, setItems] = useState<PolicyItem[]>(policy.policies);

  const [state, formAction, pending] = useActionState(savePolicyAction, initial);
  const list = useList(items, setItems);

  const payload = useMemo(
    () => JSON.stringify({ intro, policies: items, outro }),
    [intro, items, outro],
  );
  const saved = useMemo(() => JSON.stringify(policy), [policy]);
  const dirty = payload !== saved;

  return (
    <form action={formAction}>
      <input type="hidden" name="payload" value={payload} />

      <h1 className="font-display text-3xl text-ink">Salon policy</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Numbering is generated automatically from the order below.
      </p>

      <div className="mt-8">
        <Label htmlFor="intro">Intro paragraph</Label>
        <textarea
          id="intro"
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={3}
          className={inputClass}
        />
      </div>

      <div className="mt-9">
        <SubHeading
          action={
            <AddButton onClick={() => list.add({ title: "", body: "" })}>
              + Add policy
            </AddButton>
          }
        >
          Policies ({items.length})
        </SubHeading>

        <ul className="space-y-4">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex flex-wrap items-start gap-4 border border-neutral-200 p-4"
            >
              <span className="mt-3 w-6 shrink-0 text-sm text-neutral-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-[240px] flex-1 space-y-3">
                <input
                  value={item.title}
                  onChange={(e) => list.patch(index, { title: e.target.value })}
                  placeholder="Cancellation & No-Show Policy"
                  aria-label={`Policy ${index + 1} title`}
                  className={`${inputClass} mt-0`}
                />
                <textarea
                  value={item.body}
                  onChange={(e) => list.patch(index, { body: e.target.value })}
                  rows={3}
                  placeholder="What the policy says"
                  aria-label={`Policy ${index + 1} body`}
                  className={`${inputClass} mt-0`}
                />
              </div>
              <RowControls
                index={index}
                length={items.length}
                onMove={list.move}
                onRemove={list.remove}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-9">
        <Label htmlFor="outro">Closing line</Label>
        <textarea
          id="outro"
          value={outro}
          onChange={(e) => setOutro(e.target.value)}
          rows={2}
          className={inputClass}
        />
      </div>

      <StatusBar state={state} pending={pending} dirty={dirty} />
    </form>
  );
}
