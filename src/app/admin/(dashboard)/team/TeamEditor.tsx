"use client";

import { useActionState, useMemo, useState } from "react";
import type { TeamFile, TeamMember } from "@/lib/content";
import { saveTeamAction, type ActionState } from "../../actions";
import ImagePicker, { Thumb } from "../../ImagePicker";
import { IconButton, Label, StatusBar, inputClass } from "../../ui";

const initial: ActionState = {};

const blank: TeamMember = { name: "", role: "", photo: "", bio: "" };

export default function TeamEditor({ team }: { team: TeamFile }) {
  const [hero, setHero] = useState(team.hero);
  const [members, setMembers] = useState<TeamMember[]>(team.members);

  const [state, formAction, pending] = useActionState(saveTeamAction, initial);

  const payload = useMemo(
    () => JSON.stringify({ hero, members }),
    [hero, members],
  );
  const saved = useMemo(() => JSON.stringify(team), [team]);
  const dirty = payload !== saved;

  const update = (index: number, patch: Partial<TeamMember>) => {
    setMembers((list) =>
      list.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    );
  };

  const move = (index: number, delta: number) => {
    setMembers((list) => {
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

      <h1 className="font-display text-3xl text-ink">Team</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Shown on the Meet Our Team page, in this order.
      </p>

      <section className="mt-9 border border-neutral-200 p-5">
        <h2 className="font-display text-xl text-ink">Page banner</h2>
        <div className="mt-4 flex flex-wrap items-start gap-5">
          {hero ? (
            <Thumb src={hero} alt="Team page banner" className="h-28 w-44" />
          ) : null}
          <div className="min-w-[240px] flex-1">
            <ImagePicker onUploaded={setHero} label="Replace banner" compact />
            <p className="mt-2 text-xs text-neutral-400">{hero}</p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-2xl text-ink">
            Members{" "}
            <span className="font-sans text-sm text-neutral-400">
              ({members.length})
            </span>
          </h2>
          <button
            type="button"
            onClick={() => setMembers((list) => [...list, { ...blank }])}
            className="border border-neutral-300 px-4 py-2 text-xs uppercase tracking-widest text-neutral-600 transition-colors hover:border-ink hover:text-ink"
          >
            + Add member
          </button>
        </div>

        <ul className="mt-6 space-y-5">
          {members.map((member, index) => (
            <li key={index} className="border border-neutral-200 p-5">
              <div className="flex flex-wrap gap-6">
                <div className="w-40 shrink-0">
                  {member.photo ? (
                    <Thumb
                      src={member.photo}
                      alt={member.name || "Team member"}
                      className="h-48 w-40"
                    />
                  ) : (
                    <div className="flex h-48 w-40 items-center justify-center border border-dashed border-neutral-300 text-xs text-neutral-400">
                      No photo
                    </div>
                  )}
                  <ImagePicker
                    onUploaded={(src) => update(index, { photo: src })}
                    label={`Photo for ${member.name || "member"}`}
                  />
                </div>

                <div className="min-w-[260px] flex-1 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`name-${index}`}>Name</Label>
                      <input
                        id={`name-${index}`}
                        value={member.name}
                        onChange={(e) => update(index, { name: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`role-${index}`}>Role</Label>
                      <input
                        id={`role-${index}`}
                        value={member.role}
                        onChange={(e) => update(index, { role: e.target.value })}
                        placeholder="Nail Technician"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`bio-${index}`}>Bio</Label>
                    <textarea
                      id={`bio-${index}`}
                      value={member.bio}
                      onChange={(e) => update(index, { bio: e.target.value })}
                      rows={5}
                      className={inputClass}
                    />
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
                    disabled={index === members.length - 1}
                  >
                    ↓
                  </IconButton>
                  <IconButton
                    label="Remove member"
                    onClick={() =>
                      setMembers((list) => list.filter((_, i) => i !== index))
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
      </section>

      <StatusBar state={state} pending={pending} dirty={dirty} />
    </form>
  );
}
