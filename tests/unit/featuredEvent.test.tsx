import { render, renderHook, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import FeaturedEventSection from "../../src/components/FeaturedEventSection";
import { siteImages } from "../../src/data/images";
import { churchInfo, featuredEvent, type FeaturedEvent } from "../../src/data/site";
import { useFeaturedEvent } from "../../src/hooks/useFeaturedEvent";
import {
  formatEventDateLong,
  formatEventDateShort,
  isFeaturedEventActive,
  todayInChicago
} from "../../src/utils/featuredEvent";
import { renderApp } from "./renderApp";

const sample: FeaturedEvent = {
  title: "Harvest Festival",
  startsOn: "2026-11-14",
  endsOn: "2026-11-14",
  time: "11:00 AM",
  location: churchInfo.address.short,
  directionsUrl: churchInfo.address.directionsUrl,
  summary: "A day of thanksgiving together.",
  flyer: siteImages.featuredEventFlyer,
  flyerAlt: "Harvest Festival flyer"
};

// Pins "today" without freezing timers, so React effects still run.
function setToday(iso: string) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(`${iso}T17:00:00Z`));
}

afterEach(() => {
  vi.useRealTimers();
});

describe("featured event dates", () => {
  it("stays active through its last day, then expires", () => {
    expect(isFeaturedEventActive(sample, "2026-11-01")).toBe(true);
    expect(isFeaturedEventActive(sample, "2026-11-14")).toBe(true);
    expect(isFeaturedEventActive(sample, "2026-11-15")).toBe(false);
    expect(isFeaturedEventActive({ ...sample, endsOn: "2026-11-16" }, "2026-11-15")).toBe(true);
  });

  it("treats no featured event as inactive", () => {
    expect(isFeaturedEventActive(null, "2026-11-01")).toBe(false);
  });

  it("reads today in Chicago time, not UTC", () => {
    // 11:30 PM on Oct 11 in Chicago is already Oct 12 in UTC.
    expect(todayInChicago(new Date("2026-10-12T04:30:00Z"))).toBe("2026-10-11");
  });

  it("formats one-day and multi-day dates", () => {
    expect(formatEventDateShort(sample)).toBe("Sat, Nov 14");
    expect(formatEventDateLong(sample)).toBe("Saturday, November 14");
    expect(formatEventDateShort({ ...sample, endsOn: "2026-11-15" })).toBe("Nov 14 – 15");
    expect(formatEventDateShort({ ...sample, startsOn: "2026-10-31", endsOn: "2026-11-02" })).toBe("Oct 31 – Nov 2");
  });

  it("drops an event after mount once the visitor's date has passed it", () => {
    setToday("2026-11-15");
    const { result } = renderHook(() => useFeaturedEvent(sample));
    expect(result.current).toBeNull();
  });

  it("keeps an upcoming event", () => {
    setToday("2026-11-10");
    const { result } = renderHook(() => useFeaturedEvent(sample));
    expect(result.current).toBe(sample);
  });
});

describe("FeaturedEventSection", () => {
  const renderSection = (event: FeaturedEvent) =>
    render(
      <MemoryRouter>
        <FeaturedEventSection event={event} />
      </MemoryRouter>
    );

  it("shows the whole flyer, a full-size link, and the facts as text", () => {
    renderSection(sample);
    const section = screen.getByRole("region", { name: sample.title });
    expect(section).toHaveAttribute("id", "featured");
    const flyer = within(section).getByRole("img", { name: sample.flyerAlt });
    expect(flyer).toHaveAttribute("srcset", siteImages.featuredEventFlyer.srcSet);
    expect(within(section).getByRole("link", { name: /View full-size flyer/ })).toHaveAttribute(
      "href",
      siteImages.featuredEventFlyer.src
    );
    expect(section).toHaveTextContent("Saturday, November 14");
    expect(section).toHaveTextContent(sample.time);
    expect(section).toHaveTextContent(sample.location);
    expect(within(section).getByRole("link", { name: /Get directions/ })).toHaveAttribute("href", sample.directionsUrl);
  });

  it("letters a placeholder poster when no flyer was supplied", () => {
    const { container } = renderSection({ ...sample, flyer: null });
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    const poster = container.querySelector(".ctc-featured-poster");
    expect(poster).toHaveAttribute("aria-hidden", "true");
    expect(poster).toHaveTextContent("Nov");
    expect(poster).toHaveTextContent("14");
    expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument();
  });
});

// These follow whatever event is in src/data/site.ts this week, so they run
// only while one is set.
describe.runIf(featuredEvent)("featured event on the site", () => {
  const event = featuredEvent!;

  it("links from the homepage hero to the Events page section", () => {
    setToday(event.startsOn);
    const { container } = renderApp("/");
    // Wider screens show the notice card; phones show a row inside the
    // "This Sunday" card instead (CSS picks one). Both go to the same place.
    const links = screen.getAllByRole("link", { name: new RegExp(event.title) });
    expect(links).toHaveLength(2);
    for (const link of links) expect(link).toHaveAttribute("href", "/events#featured");
    expect(container.querySelector(".ctc-hero-notice")).toHaveTextContent(formatEventDateShort(event));
    const cardRow = container.querySelector(".ctc-hero-card .ctc-hero-card-event") as HTMLElement;
    expect(cardRow).toHaveAccessibleName(new RegExp(formatEventDateLong(event)));
    expect(cardRow).not.toHaveTextContent(/featured/i);
  });

  it("features the event at the top of the Events page", () => {
    setToday(event.startsOn);
    renderApp("/events");
    expect(screen.getByRole("region", { name: event.title })).toHaveAttribute("id", "featured");
  });

  it("disappears from both pages the day after it ends", () => {
    const after = new Date(`${event.endsOn}T12:00:00Z`);
    after.setUTCDate(after.getUTCDate() + 1);
    setToday(after.toISOString().slice(0, 10));
    const home = renderApp("/");
    expect(home.container.querySelector(".ctc-hero-notice")).toBeNull();
    expect(home.container.querySelector(".ctc-hero-card-event")).toBeNull();
    home.unmount();
    renderApp("/events");
    expect(document.getElementById("featured")).toBeNull();
  });
});
