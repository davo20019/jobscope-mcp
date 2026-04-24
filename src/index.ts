interface Env {
  MCP_OBJECT: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/health") {
      return Response.json({
        name: "jobscope-mcp",
        version: "0.1.0",
        status: "ok",
      });
    }
    return new Response("Not found", { status: 404 });
  },
};
