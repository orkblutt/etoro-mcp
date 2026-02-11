import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { EtoroClient } from "../client/etoro-client.js";
import { formatToolResponse, withErrorHandling } from "../utils/errors.js";

interface WatchlistItem {
  itemId: number;
  itemType: string;
  itemRank: number;
  market?: {
    symbolName?: string;
    displayName?: string;
    exchangeId?: number;
  };
}

interface Watchlist {
  watchlistId: string;
  name: string;
  watchlistType: string;
  totalItems: number;
  isDefault: boolean;
  items?: WatchlistItem[];
}

interface WatchlistsResponse {
  watchlists: Watchlist[];
}

function trimWatchlists(data: WatchlistsResponse) {
  return {
    watchlists: data.watchlists.map((w) => ({
      watchlistId: w.watchlistId,
      name: w.name,
      type: w.watchlistType,
      totalItems: w.totalItems,
      isDefault: w.isDefault,
      items: (w.items || []).map((item) => ({
        instrumentId: item.itemId,
        symbol: item.market?.symbolName,
        displayName: item.market?.displayName,
      })),
    })),
  };
}

export function registerWatchlistsTools(server: McpServer, client: EtoroClient): void {
  // 1. get_watchlists
  server.tool(
    "get_watchlists",
    "Get all watchlists for the current user",
    {},
    withErrorHandling(async () => {
      const data = await client.get<WatchlistsResponse>("/watchlists");
      return formatToolResponse(trimWatchlists(data));
    })
  );

  // 2. create_watchlist
  server.tool(
    "create_watchlist",
    "Create a new watchlist",
    {
      name: z.string().describe("Name for the new watchlist (max 100 chars)"),
    },
    withErrorHandling(async (args) => {
      const params = new URLSearchParams({ name: args.name });
      const data = await client.post(`/watchlists?${params}`);
      return formatToolResponse(data);
    })
  );

  // 3. delete_watchlist
  server.tool(
    "delete_watchlist",
    "Delete a watchlist by its ID",
    {
      watchlistId: z.number().describe("Watchlist ID to delete"),
    },
    withErrorHandling(async (args) => {
      const data = await client.delete(`/watchlists/${args.watchlistId}`);
      return formatToolResponse(data);
    })
  );

  // 4. rename_watchlist
  server.tool(
    "rename_watchlist",
    "Rename an existing watchlist",
    {
      watchlistId: z.number().describe("Watchlist ID to rename"),
      name: z.string().describe("New name for the watchlist (max 100 chars)"),
    },
    withErrorHandling(async (args) => {
      const params = new URLSearchParams({ newName: args.name });
      const data = await client.put(`/watchlists/${args.watchlistId}?${params}`);
      return formatToolResponse(data);
    })
  );

  // 5. add_watchlist_items
  server.tool(
    "add_watchlist_items",
    "Add instruments to an existing watchlist",
    {
      watchlistId: z.number().describe("Watchlist ID"),
      instrumentIds: z.array(z.number()).describe("Instrument IDs to add"),
    },
    withErrorHandling(async (args) => {
      // API expects a plain array of instrument IDs
      const data = await client.post(
        `/watchlists/${args.watchlistId}/items`,
        args.instrumentIds
      );
      return formatToolResponse(data);
    })
  );

  // 6. remove_watchlist_item
  server.tool(
    "remove_watchlist_item",
    "Remove an instrument from a watchlist",
    {
      watchlistId: z.number().describe("Watchlist ID"),
      instrumentId: z.number().describe("Instrument ID to remove"),
    },
    withErrorHandling(async (args) => {
      // API expects DELETE with a body array of WatchlistItemDto
      const data = await client.delete(
        `/watchlists/${args.watchlistId}/items`,
        [{ ItemId: args.instrumentId, ItemType: "Instrument" }]
      );
      return formatToolResponse(data);
    })
  );

  // 7. set_default_watchlist
  server.tool(
    "set_default_watchlist",
    "Set a watchlist as the default watchlist",
    {
      watchlistId: z.number().describe("Watchlist ID to set as default"),
    },
    withErrorHandling(async (args) => {
      const data = await client.put(`/watchlists/setUserSelectedUserDefault/${args.watchlistId}`);
      return formatToolResponse(data);
    })
  );

  // 8. get_curated_lists
  server.tool(
    "get_curated_lists",
    "Get eToro's curated/featured instrument lists",
    {},
    withErrorHandling(async () => {
      const data = await client.get("/curated-lists");
      return formatToolResponse(data);
    })
  );

  // 9. get_public_watchlists
  server.tool(
    "get_public_watchlists",
    "Get publicly shared watchlists from a user",
    {
      userId: z.number().describe("User ID whose public watchlists to retrieve"),
    },
    withErrorHandling(async (args) => {
      const data = await client.get(`/watchlists/public/${args.userId}`);
      return formatToolResponse(data);
    })
  );
}
