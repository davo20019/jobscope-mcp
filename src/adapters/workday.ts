import { postJson, type FetchImpl } from "./fetch";
import type { AtsAdapter, RawJob } from "./types";
import { JobSchema, JobDetailSchema } from "../schemas";
import type { CompanyRef, Job, JobDetail } from "../schemas";

type WorkdayRawJob = {
  title: string;
  externalPath: string;
  locationsText?: string;
  postedOn?: string;
  bulletFields?: string[];
};

const PAGE_SIZE = 20;
const MAX_JOBS_PER_COMPANY = 200;

export interface WorkdayFetchOptions {
  fetchImpl?: FetchImpl;
}

function parseSlug(atsSlug: string): { tenant: string; shard: string; site: string } {
  const parts = atsSlug.split(":");
  if (parts.length !== 3) {
    throw new Error(`workday slug must be 'tenant:shard:site', got: ${atsSlug}`);
  }
  return { tenant: parts[0], shard: parts[1], site: parts[2] };
}

function buildUrl(atsSlug: string): string {
  const { tenant, shard, site } = parseSlug(atsSlug);
  return `https://${tenant}.${shard}.myworkdayjobs.com/wday/cxs/${tenant}/${site}/jobs`;
}

async function fetchJobs(atsSlug: string, opts: WorkdayFetchOptions = {}): Promise<RawJob[]> {
  const url = buildUrl(atsSlug);
  const all: RawJob[] = [];
  let offset = 0;

  while (all.length < MAX_JOBS_PER_COMPANY) {
    const body = await postJson<{ total?: number; jobPostings?: WorkdayRawJob[] }>(
      url,
      { appliedFacets: {}, limit: PAGE_SIZE, offset, searchText: "" },
      { fetchImpl: opts.fetchImpl }
    );
    const page = body.jobPostings ?? [];
    if (page.length === 0) break;
    for (const j of page) {
      if (all.length >= MAX_JOBS_PER_COMPANY) break;
      all.push({ source_id: j.externalPath, raw: j });
    }
    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
    if (body.total != null && offset >= body.total) break;
  }

  return all;
}

async function fetchJob(
  atsSlug: string,
  jobId: string,
  opts: WorkdayFetchOptions = {}
): Promise<RawJob | null> {
  const list = await fetchJobs(atsSlug, opts);
  return list.find((j) => j.source_id === jobId) ?? null;
}

function inferRemote(locationsText: string): "remote" | "hybrid" | "onsite" | "unknown" {
  const lower = locationsText.toLowerCase();
  if (!lower) return "unknown";
  if (lower.includes("remote")) return "remote";
  if (lower.includes("hybrid")) return "hybrid";
  return "unknown";
}

function normalize(raw: RawJob, company: CompanyRef): Job {
  const r = raw.raw as WorkdayRawJob;
  const locationsText = r.locationsText ?? "";
  const locations = locationsText ? locationsText.split(/\s*\|\s*|\s*;\s*/).filter(Boolean) : [];
  const { tenant, shard, site } = parseSlug(company.ats_slug);
  const apply = `https://${tenant}.${shard}.myworkdayjobs.com/${site}${r.externalPath}`;
  const job = {
    id: `workday:${company.company_slug}:${raw.source_id}`,
    source: "workday",
    company: company.name,
    company_slug: company.company_slug,
    title: r.title,
    locations,
    remote: inferRemote(locationsText),
    employment_type: "unknown" as const,
    department: null,
    posted_at: null,
    url: apply,
    description_preview: "",
  };
  return JobSchema.parse(job);
}

function toDetail(raw: RawJob, company: CompanyRef): JobDetail {
  const base = normalize(raw, company);
  const r = raw.raw as WorkdayRawJob;
  const detail = {
    ...base,
    description: "",
    description_html: "",
    team: null,
    compensation: null,
    raw: r,
  };
  return JobDetailSchema.parse(detail);
}

export const workdayAdapter: AtsAdapter & {
  fetchJobs: (slug: string, opts?: WorkdayFetchOptions) => Promise<RawJob[]>;
  fetchJob: (slug: string, id: string, opts?: WorkdayFetchOptions) => Promise<RawJob | null>;
} = {
  name: "workday",
  fetchJobs,
  fetchJob,
  normalize,
  toDetail,
};
