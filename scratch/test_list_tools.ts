import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  console.log("🚀 Starting MCP Client List Tools Test...");
  
  const transport = new StdioClientTransport({
    command: "node",
    args: ["./mcp-server/dist/index.js"],
    env: {
      ...process.env
    }
  });

  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log("✅ Connected to Sarkar AstroForge MCP server!");

  const tools = [
    "list_all_used_tic_ids",
    "list_discovery_tic_ids",
    "list_rejected_tic_ids",
    "list_discovery_theses",
    "list_rejection_theses"
  ];

  for (const tool of tools) {
    console.log(`\n──────────────────────────────────────────`);
    console.log(`Calling tool: ${tool}`);
    try {
      const res = await client.callTool({ name: tool, arguments: {} });
      console.log(`Response content:`);
      console.log(res.content[0].text);
    } catch (e: any) {
      console.error(`❌ Failed to call tool ${tool}:`, e.message);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
