import { NetworkError, NotFoundError, ParseError, RateLimitError } from "../errors";

export type FetchImpl = typeof fetch;

export interface FetchJsonOptions {
  fetchImpl?: FetchImpl;
  headers?: Record<string, string>;
  retryDelayMs?: number;
}

export async function fetchJson<T = unknown>(
  url: string,
  options: FetchJsonOptions = {}
): Promise<T> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const headers = {
    accept: "application/json",
    "user-agent": "jobscope-mcp/0.1.0 (+https://github.com/davo20019/jobscope-mcp)",
    ...(options.headers ?? {}),
  };

  const attempt = async (): Promise<Response> => {
    try {
      return await fetchImpl(url, { headers });
    } catch (e) {
      throw new NetworkError(
        e instanceof Error ? `fetch failed: ${e.message}` : "fetch failed"
      );
    }
  };

  let response = await attempt();

  if (response.status === 429) {
    const delay = options.retryDelayMs ?? 1000;
    await new Promise((r) => setTimeout(r, delay));
    response = await attempt();
    if (response.status === 429) {
      throw new RateLimitError(`rate limited by ${new URL(url).host}`);
    }
  }

  if (response.status === 404) {
    throw new NotFoundError(`not found: ${url}`);
  }
  if (!response.ok) {
    throw new NetworkError(`${response.status} ${response.statusText} from ${url}`);
  }

  try {
    return (await response.json()) as T;
  } catch (e) {
    throw new ParseError(
      e instanceof Error ? `parse failed: ${e.message}` : "parse failed"
    );
  }
}
