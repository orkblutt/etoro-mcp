#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { createServer } from "./server.js";
import { logger } from "./utils/logger.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const server = createServer(config);
  const transport = new StdioServerTransport();

  logger.info("Starting eToro MCP server...");
  await server.connect(transport);
  logger.info("eToro MCP server running on stdio.");
}

main().catch((error) => {
  logger.error("Fatal error:", error);
  process.exit(1);
});
