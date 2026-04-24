import { describe, expect, it } from "vitest";
import { applyFilters } from "../../src/search/filter";
import type { Job } from "../../src/schemas";

const base: Job = {
  id: "greenhouse:stripe:1",
  source: "greenhouse",
  company: "Stripe",
  company_slug: "stripe",
  title: "Senior Backend Engineer",
  locations: ["Remote - US"],
  remote: "remote",
  employment_type: "full_time",
  department: "Engineering",
  posted_at: "2026-04-20T00:00:00Z",
  url: "https://x",
  description_preview: "We build payments infrastructure.",
};

const onsite: Job = { ...base, id: "greenhouse:stripe:2", locations: ["Dublin"], remote: "onsite" };
const old: Job = { ...base, id: "greenhouse:stripe:3", posted_at: "2024-01-01T00:00:00Z" };

describe("applyFilters", () => {
  it("query filters by title substring (case-insensitive)", () => {
    expect(applyFilters([base, onsite], { query: "senior" }).length).toBe(2);
    expect(applyFilters([base, onsite], { query: "nope-xyz" }).length).toBe(0);
  });

  it("query matches description_preview", () => {
    expect(applyFilters([base], { query: "payments" }).length).toBe(1);
  });

  it("location filters by substring", () => {
    expect(applyFilters([base, onsite], { location: "remote" })[0].id).toBe(base.id);
  });

  it("remote enum filters", () => {
    expect(applyFilters([base, onsite], { remote: "remote" }).length).toBe(1);
    expect(applyFilters([base, onsite], { remote: "any" }).length).toBe(2);
  });

  it("posted_since excludes older", () => {
    expect(applyFilters([base, old], { posted_since: "2025-01-01" }).length).toBe(1);
  });
});
