"use client";

import { useActionState, useMemo, useState } from "react";
import type { HomeFile } from "@/lib/content";
import { saveHomeAction, type ActionState } from "../../actions";
import { useList } from "../../useList";
import { Label, StatusBar, inputClass } from "../../ui";
import {
  AddButton,
  Card,
  ImageListField,
  RowControls,
  SingleImageField,
  SubHeading,
  TextListField,
} from "../../fields";

const initial: ActionState = {};

export default function HomeEditor({ home }: { home: HomeFile }) {
  const [hero, setHero] = useState(home.hero);
  const [why, setWhy] = useState(home.whyClientsLoveUs);
  const [story, setStory] = useState(home.ourStory);
  const [services, setServices] = useState(home.serviceHighlights);
  const [events, setEvents] = useState(home.groupEvents);
  const [bar, setBar] = useState(home.barService);

  const [state, formAction, pending] = useActionState(saveHomeAction, initial);

  const heroSlides = useList(hero.slides, (fn) =>
    setHero((h) => ({
      ...h,
      slides: typeof fn === "function" ? fn(h.slides) : fn,
    })),
  );
  const whyImages = useList(why.images, (fn) =>
    setWhy((w) => ({
      ...w,
      images: typeof fn === "function" ? fn(w.images) : fn,
    })),
  );
  const whyItems = useList(why.items, (fn) =>
    setWhy((w) => ({ ...w, items: typeof fn === "function" ? fn(w.items) : fn })),
  );
  const storyParas = useList(story.paragraphs, (fn) =>
    setStory((s) => ({
      ...s,
      paragraphs: typeof fn === "function" ? fn(s.paragraphs) : fn,
    })),
  );
  const serviceImages = useList(services.images, (fn) =>
    setServices((s) => ({
      ...s,
      images: typeof fn === "function" ? fn(s.images) : fn,
    })),
  );
  const serviceGroups = useList(services.groups, (fn) =>
    setServices((s) => ({
      ...s,
      groups: typeof fn === "function" ? fn(s.groups) : fn,
    })),
  );
  const eventImages = useList(events.images, (fn) =>
    setEvents((e) => ({
      ...e,
      images: typeof fn === "function" ? fn(e.images) : fn,
    })),
  );
  const occasions = useList(events.occasions, (fn) =>
    setEvents((e) => ({
      ...e,
      occasions: typeof fn === "function" ? fn(e.occasions) : fn,
    })),
  );
  const perks = useList(events.perks, (fn) =>
    setEvents((e) => ({
      ...e,
      perks: typeof fn === "function" ? fn(e.perks) : fn,
    })),
  );
  const barItems = useList(bar.items, (fn) =>
    setBar((b) => ({ ...b, items: typeof fn === "function" ? fn(b.items) : fn })),
  );

  const payload = useMemo(
    () =>
      JSON.stringify({
        hero,
        whyClientsLoveUs: why,
        ourStory: story,
        serviceHighlights: services,
        groupEvents: events,
        barService: bar,
      }),
    [hero, why, story, services, events, bar],
  );
  const saved = useMemo(() => JSON.stringify(home), [home]);
  const dirty = payload !== saved;

  /** Updates one item inside one service group. */
  const patchGroupItem = (
    groupIndex: number,
    itemIndex: number,
    patch: Partial<{ name: string; body: string }>,
  ) =>
    serviceGroups.patch(groupIndex, {
      items: services.groups[groupIndex].items.map((it, i) =>
        i === itemIndex ? { ...it, ...patch } : it,
      ),
    });

  const groupItemOps = (groupIndex: number) => ({
    add: () =>
      serviceGroups.patch(groupIndex, {
        items: [...services.groups[groupIndex].items, { name: "", body: "" }],
      }),
    move: (itemIndex: number, delta: number) => {
      const items = [...services.groups[groupIndex].items];
      const target = itemIndex + delta;
      if (target < 0 || target >= items.length) return;
      [items[itemIndex], items[target]] = [items[target], items[itemIndex]];
      serviceGroups.patch(groupIndex, { items });
    },
    remove: (itemIndex: number) =>
      serviceGroups.patch(groupIndex, {
        items: services.groups[groupIndex].items.filter(
          (_, i) => i !== itemIndex,
        ),
      }),
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="payload" value={payload} />

      <h1 className="font-display text-3xl text-ink">Homepage</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Sections appear on the site in the order shown here.
      </p>

      {/* ------------------------------------------------------------ hero */}
      <Card
        title="Hero"
        description="Full-screen banner at the top. Slides rotate every 6 seconds."
      >
        <SubHeading>Slide images</SubHeading>
        <ImageListField
          images={hero.slides}
          onAdd={heroSlides.add}
          onMove={heroSlides.move}
          onRemove={heroSlides.remove}
          emptyLabel="The hero needs at least one slide."
        />

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <div>
            <Label htmlFor="tagline">Headline</Label>
            <textarea
              id="tagline"
              value={hero.tagline}
              onChange={(e) => setHero({ ...hero, tagline: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </div>
          <div>
            <Label htmlFor="intro">Intro paragraph</Label>
            <textarea
              id="intro"
              value={hero.intro}
              onChange={(e) => setHero({ ...hero, intro: e.target.value })}
              rows={5}
              className={inputClass}
            />
          </div>
        </div>
      </Card>

      {/* --------------------------------------------------------- why us */}
      <Card title="Why clients love us">
        <SubHeading>Photos beside the list</SubHeading>
        <ImageListField
          images={why.images}
          onAdd={whyImages.add}
          onMove={whyImages.move}
          onRemove={whyImages.remove}
        />

        <div className="mt-8">
          <SubHeading
            action={
              <AddButton
                onClick={() => whyItems.add({ title: "", body: "" })}
              >
                + Add reason
              </AddButton>
            }
          >
            Reasons ({why.items.length})
          </SubHeading>

          <ul className="space-y-4">
            {why.items.map((item, index) => (
              <li
                key={index}
                className="flex flex-wrap items-start gap-4 border border-neutral-200 p-4"
              >
                <div className="min-w-[240px] flex-1 space-y-3">
                  <input
                    value={item.title}
                    onChange={(e) =>
                      whyItems.patch(index, { title: e.target.value })
                    }
                    placeholder="Title"
                    aria-label={`Reason ${index + 1} title`}
                    className={`${inputClass} mt-0`}
                  />
                  <textarea
                    value={item.body}
                    onChange={(e) =>
                      whyItems.patch(index, { body: e.target.value })
                    }
                    rows={3}
                    placeholder="Description"
                    aria-label={`Reason ${index + 1} description`}
                    className={`${inputClass} mt-0`}
                  />
                </div>
                <RowControls
                  index={index}
                  length={why.items.length}
                  onMove={whyItems.move}
                  onRemove={whyItems.remove}
                />
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* ------------------------------------------------------ our story */}
      <Card title="Our story">
        <SingleImageField
          label="Wide banner image"
          src={story.image}
          onChange={(src) => setStory({ ...story, image: src })}
        />

        <div className="mt-7">
          <Label htmlFor="story-lead">Lead sentence</Label>
          <textarea
            id="story-lead"
            value={story.lead}
            onChange={(e) => setStory({ ...story, lead: e.target.value })}
            rows={2}
            className={inputClass}
          />
        </div>

        <div className="mt-7">
          <SubHeading>Paragraphs</SubHeading>
          <TextListField
            values={story.paragraphs}
            multiline
            onChange={(i, v) => storyParas.set(i, v)}
            onAdd={() => storyParas.add("")}
            onMove={storyParas.move}
            onRemove={storyParas.remove}
            addLabel="+ Add paragraph"
          />
        </div>
      </Card>

      {/* -------------------------------------------------------- services */}
      <Card
        title="Our services"
        description="The service summary on the homepage. The full price list lives in code, on the Services page."
      >
        <SubHeading>Three feature photos</SubHeading>
        <ImageListField
          images={services.images.map((i) => i.src)}
          alts={services.images.map((i) => i.alt)}
          onAdd={(src) => serviceImages.add({ src, alt: "" })}
          onMove={serviceImages.move}
          onRemove={serviceImages.remove}
          onAlt={(i, alt) => serviceImages.patch(i, { alt })}
        />

        <div className="mt-8">
          <SubHeading
            action={
              <AddButton
                onClick={() => serviceGroups.add({ title: "", items: [] })}
              >
                + Add group
              </AddButton>
            }
          >
            Service groups ({services.groups.length})
          </SubHeading>

          <div className="space-y-5">
            {services.groups.map((group, gi) => {
              const ops = groupItemOps(gi);
              return (
                <div key={gi} className="border border-neutral-200 p-4">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="min-w-[240px] flex-1">
                      <Label htmlFor={`group-${gi}`}>Group title</Label>
                      <input
                        id={`group-${gi}`}
                        value={group.title}
                        onChange={(e) =>
                          serviceGroups.patch(gi, { title: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                    <RowControls
                      index={gi}
                      length={services.groups.length}
                      onMove={serviceGroups.move}
                      onRemove={serviceGroups.remove}
                    />
                  </div>

                  <ul className="mt-5 space-y-3 border-l border-neutral-200 pl-4">
                    {group.items.map((item, ii) => (
                      <li key={ii} className="flex flex-wrap items-start gap-3">
                        <div className="min-w-[220px] flex-1 space-y-2">
                          <input
                            value={item.name}
                            onChange={(e) =>
                              patchGroupItem(gi, ii, { name: e.target.value })
                            }
                            placeholder="Service name"
                            aria-label={`Service ${ii + 1} name`}
                            className={`${inputClass} mt-0`}
                          />
                          <textarea
                            value={item.body}
                            onChange={(e) =>
                              patchGroupItem(gi, ii, { body: e.target.value })
                            }
                            rows={2}
                            placeholder="Description"
                            aria-label={`Service ${ii + 1} description`}
                            className={`${inputClass} mt-0`}
                          />
                        </div>
                        <RowControls
                          index={ii}
                          length={group.items.length}
                          onMove={ops.move}
                          onRemove={ops.remove}
                        />
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 pl-4">
                    <AddButton onClick={ops.add}>+ Add service</AddButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ---------------------------------------------------------- events */}
      <Card title="Group celebrations & private events">
        <SubHeading>Photos</SubHeading>
        <ImageListField
          images={events.images}
          onAdd={eventImages.add}
          onMove={eventImages.move}
          onRemove={eventImages.remove}
        />

        <div className="mt-7">
          <Label htmlFor="events-lead">Lead sentence</Label>
          <textarea
            id="events-lead"
            value={events.lead}
            onChange={(e) => setEvents({ ...events, lead: e.target.value })}
            rows={2}
            className={inputClass}
          />
        </div>

        <div className="mt-7">
          <SubHeading>Occasions we host</SubHeading>
          <TextListField
            values={events.occasions}
            onChange={(i, v) => occasions.set(i, v)}
            onAdd={() => occasions.add("")}
            onMove={occasions.move}
            onRemove={occasions.remove}
            addLabel="+ Add occasion"
            placeholder="Birthdays"
          />
        </div>

        <div className="mt-7">
          <Label htmlFor="perks-intro">Perks intro</Label>
          <input
            id="perks-intro"
            value={events.perksIntro}
            onChange={(e) =>
              setEvents({ ...events, perksIntro: e.target.value })
            }
            className={inputClass}
          />
        </div>

        <div className="mt-7">
          <SubHeading>Perks</SubHeading>
          <TextListField
            values={events.perks}
            onChange={(i, v) => perks.set(i, v)}
            onAdd={() => perks.add("")}
            onMove={perks.move}
            onRemove={perks.remove}
            addLabel="+ Add perk"
          />
        </div>
      </Card>

      {/* ------------------------------------------------------------- bar */}
      <Card title="Full bar service">
        <SingleImageField
          label="Section image"
          src={bar.image}
          onChange={(src) => setBar({ ...bar, image: src })}
        />

        <div className="mt-7">
          <Label htmlFor="bar-lead">Lead sentence</Label>
          <textarea
            id="bar-lead"
            value={bar.lead}
            onChange={(e) => setBar({ ...bar, lead: e.target.value })}
            rows={2}
            className={inputClass}
          />
        </div>

        <div className="mt-7">
          <SubHeading>What we offer</SubHeading>
          <TextListField
            values={bar.items}
            onChange={(i, v) => barItems.set(i, v)}
            onAdd={() => barItems.add("")}
            onMove={barItems.move}
            onRemove={barItems.remove}
            addLabel="+ Add drink"
          />
        </div>

        <div className="mt-7">
          <Label htmlFor="bar-outro">Closing line</Label>
          <input
            id="bar-outro"
            value={bar.outro}
            onChange={(e) => setBar({ ...bar, outro: e.target.value })}
            className={inputClass}
          />
        </div>
      </Card>

      <StatusBar state={state} pending={pending} dirty={dirty} />
    </form>
  );
}
