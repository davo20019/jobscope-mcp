import type { Job } from "../schemas";

export interface FilterOptions {
  query?: string;
  location?: string;
  remote?: "any" | "remote" | "hybrid" | "onsite";
  posted_since?: string; // ISO8601 date
}

export function applyFilters(jobs: Job[], opts: FilterOptions): Job[] {
  const q = opts.query?.toLowerCase();
  const loc = opts.location?.toLowerCase();
  const since = opts.posted_since ? Date.parse(opts.posted_since) : null;
  const remote = opts.remote && opts.remote !== "any" ? opts.remote : null;
  return jobs.filter((j) => {
    if (q) {
      const hay = `${j.title} ${j.description_preview}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (loc) {
      const hay = j.locations.join(" ").toLowerCase();
      if (!hay.includes(loc)) return false;
    }
    if (remote && j.remote !== remote) return false;
    if (since && j.posted_at) {
      const ts = Date.parse(j.posted_at);
      if (Number.isFinite(ts) && ts < since) return false;
    }
    return true;
  });
}
