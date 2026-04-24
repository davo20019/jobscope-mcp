import { SearchJobsInputSchema, type SearchJobsInput } from "../schemas";
import { loadDirectory, getCompany } from "../directory/loader";
import { adapters } from "../adapters/registry";
import { runSearch, type SearchResult } from "../search/engine";

export const SEARCH_JOBS_DESCRIPTION = [
  "Search open roles across all configured ATS platforms (Greenhouse, Lever, Ashby).",
  "Fans out across a bundled company directory and returns a normalized, ranked list of jobs.",
  "Supports free-text query, location substring, remote-policy filter, posted-since cutoff.",
  "Use `companies` to restrict the search to a specific set of directory slugs.",
  "Use `ats` to restrict to specific sources.",
  "Returns at most `limit` results (default 50, max 200).",
].join(" ");

export const searchJobsInputSchema = SearchJobsInputSchema;

export async function searchJobsTool(rawInput: unknown): Promise<SearchResult> {
  const input = SearchJobsInputSchema.parse(rawInput) as SearchJobsInput;
  const dir = loadDirectory();
  let companies = input.companies
    ? input.companies.map((slug) => getCompany(slug)).filter((c): c is NonNullable<typeof c> => !!c)
    : dir.companies;
  if (input.ats && input.ats.length > 0) {
    const set = new Set(input.ats);
    companies = companies.filter((c) => set.has(c.ats));
  }
  return runSearch({ input, companies, adapters });
}
