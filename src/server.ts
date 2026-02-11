import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Config } from "./config.js";
import { EtoroClient } from "./client/etoro-client.js";
import { registerAllTools } from "./tools/index.js";

export function createServer(config: Config): McpServer {
  const server = new McpServer({
    name: "etoro-mcp",
    version: "1.0.0",
  });

  const client = new EtoroClient(config);
  registerAllTools(server, client);

  return server;
}
