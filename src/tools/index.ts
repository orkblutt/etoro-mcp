import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EtoroClient } from "../client/etoro-client.js";
import { registerMarketDataTools } from "./market-data.js";
import { registerTradingTools } from "./trading.js";
import { registerFeedsTools } from "./feeds.js";
import { registerWatchlistsTools } from "./watchlists.js";
import { registerUserTools } from "./user.js";

export function registerAllTools(server: McpServer, client: EtoroClient): void {
  registerMarketDataTools(server, client);
  registerTradingTools(server, client);
  registerFeedsTools(server, client);
  registerWatchlistsTools(server, client);
  registerUserTools(server, client);
}
