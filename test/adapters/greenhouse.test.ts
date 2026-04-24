import { describe, expect, it, vi } from "vitest";
import fixture from "../fixtures/greenhouse/jobs-stripe.json";
import { greenhouseAdapter } from "../../src/adapters/greenhouse";

const company = {
  name: "Stripe",
  company_slug: "stripe",
  ats: "greenhouse",
  ats_slug: "stripe",
};

describe("greenhouseAdapter", () => {
  it("has name 'greenhouse'", () => {
    expect(greenhouseAdapter.name).toBe("greenhouse");
  });

  it("fetchJobs returns RawJob[] for a slug", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(fixture), { status: 200 }));
    const jobs = await greenhouseAdapter.fetchJobs("stripe", { fetchImpl });
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0].source_id).toBeDefined();
  });

  it("normalize produces a valid Job with deterministic id", () => {
    const raw = { source_id: "123", raw: fixture.jobs[0] };
    const job = greenhouseAdapter.normalize(raw, company);
    expect(job.id).toBe(`greenhouse:stripe:${raw.source_id}`);
    expect(job.source).toBe("greenhouse");
    expect(job.company).toBe("Stripe");
    expect(job.title).toBeTruthy();
    expect(Array.isArray(job.locations)).toBe(true);
    expect(["remote", "hybrid", "onsite", "unknown"]).toContain(job.remote);
  });

  it("normalize infers remote=remote when location contains 'Remote'", () => {
    const raw = {
      source_id: "1",
      raw: {
        id: 1,
        title: "Engineer",
        location: { name: "Remote - United States" },
        absolute_url: "https://x",
        updated_at: "2026-04-20T00:00:00Z",
        departments: [],
        content: "hi",
      },
    };
    const job = greenhouseAdapter.normalize(raw, company);
    expect(job.remote).toBe("remote");
  });
});
