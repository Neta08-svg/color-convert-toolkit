#!/usr/bin/env node
// huekit MCP server — exposes the live https://color.wrapper-agency.com API as
// MCP tools so agents can call it natively. Thin wrapper over /api/v1.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = process.env.HUEKIT_BASE || "https://color.wrapper-agency.com";
const server = new McpServer({ name: 'huekit', version: "1.0.0" });

server.registerTool(
  'convert_color',
  {
    description: 'Convert a color to HEX/RGB/HSL/HSV/CMYK/OKLCH plus nearest CSS name and closest Pantone-style match.',
    inputSchema: {
      value: z.string().describe('A color: hex (#ff5733 or ff5733) or CSS name (rebeccapurple)')
    },
  },
  async (args) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(args)) {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    }
    const r = await fetch(`${BASE}/api/v1/color?${qs.toString()}`);
    return { content: [{ type: "text", text: await r.text() }] };
  }
);

await server.connect(new StdioServerTransport());
