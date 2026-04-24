# jobscope-mcp

Open-source Model Context Protocol (MCP) server that gives AI agents (Claude Code, Codex, and any other MCP client) specialized tools to discover job openings across Applicant Tracking System (ATS) platforms.

The agent supplies reasoning and memory. jobscope-mcp supplies normalized, multi-source job search.

## Sources supported (v1)

- Greenhouse (`boards-api.greenhouse.io`)
- Lever (`api.lever.co`)
- Ashby (`api.ashbyhq.com`)

The MCP bundles a hand-curated company directory covering these three platforms and queries their public JSON APIs directly at request time.

## Tools

- `search_jobs` - fan out across the directory, return a normalized ranked list
- `get_job` - fetch full detail for one posting
- `list_companies` - browse the bundled directory
- `list_sources` - introspect which ATSs are configured and when the directory was built

## Design philosophy

- Stateless. No user data is persisted anywhere.
- Thin over clever. The MCP wraps public APIs and normalizes output. Reasoning stays in the agent.
- Complementary to the underlying ATS platforms and aggregators.

See `docs/superpowers/specs/2026-04-23-jobscope-mcp-design.md` for the full design.

## Running locally

```sh
npm install
npm test
npm run dev    # starts wrangler dev on http://127.0.0.1:8787
```

Health check: `curl http://127.0.0.1:8787/health`

## License

MIT. See `LICENSE`.

## Privacy

See `PRIVACY.md`.
