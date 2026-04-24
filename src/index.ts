import { JobscopeMcp } from "./mcp-server";

export { JobscopeMcp };

const CANONICAL_PATH = "/find-jobs";
const LEGACY_PATH = "/mcp";

interface Env {
  MCP_OBJECT: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === CANONICAL_PATH || path.startsWith(`${CANONICAL_PATH}/`)) {
      return JobscopeMcp.serve(CANONICAL_PATH).fetch(request, env as never, ctx);
    }
    if (path === LEGACY_PATH || path.startsWith(`${LEGACY_PATH}/`)) {
      return JobscopeMcp.serve(LEGACY_PATH).fetch(request, env as never, ctx);
    }
    if (path === "/sse" || path.startsWith("/sse/")) {
      return JobscopeMcp.serveSSE("/sse").fetch(request, env as never, ctx);
    }
    if (path === "/" || path === "/health") {
      return Response.json({
        name: "jobscope-mcp",
        version: "0.1.0",
        status: "ok",
        mcpEndpoint: CANONICAL_PATH,
        legacyMcpEndpoint: LEGACY_PATH,
        sseEndpoint: "/sse",
        source: "https://github.com/davo20019/jobscope-mcp",
      });
    }
    return new Response("Not found", { status: 404 });
  },
};
