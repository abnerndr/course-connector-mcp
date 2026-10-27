import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { createRequire } from "node:module";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
const dir = await mkdtemp(join(tmpdir(), "pace-mcp-test-"));
const require = createRequire(import.meta.url);
const client = new Client({ name: "pace-smoke", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [require.resolve("tsx/cli"), resolve("src/index.ts")],
  env: {
    ...Object.fromEntries(
      Object.entries(process.env).filter(
        (e): e is [string, string] => typeof e[1] === "string",
      ),
    ),
    PACE_DATA_DIR: dir,
  },
});
try {
  await client.connect(transport);
  const tools = await client.listTools();
  assert.equal(tools.tools.length, 8);
  const result = await client.callTool({
    name: "cadastrar_projeto",
    arguments: {
      name: "MCP smoke",
      url: "https://example.com",
      searchConsoleSite: "sc-domain:example.com",
      analyticsProperty: "123",
    },
  });
  assert.ok(!result.isError);
  const listing = await client.callTool({
    name: "listar_projetos",
    arguments: {},
  });
  assert.ok(JSON.stringify(listing).includes("MCP smoke"));
  const error = await client.callTool({
    name: "produzir_diagnostico",
    arguments: { projectId: "00000000-0000-4000-8000-000000000000" },
  });
  assert.equal(error.isError, true);
  console.log(
    "MCP smoke: handshake, 8 tools, creation, listing, error handling OK",
  );
} finally {
  await client.close();
  await rm(dir, { recursive: true, force: true });
}
