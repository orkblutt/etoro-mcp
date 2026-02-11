import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { EtoroClient } from "../client/etoro-client.js";
import { formatToolResponse, withErrorHandling } from "../utils/errors.js";

export function registerMarketDataTools(server: McpServer, client: EtoroClient): void {
  // 1. search_instruments
  server.tool(
    "search_instruments",
    "Search for eToro instruments by keyword (stocks, crypto, ETFs, etc.)",
    {
      query: z.string().describe("Search keyword (e.g. 'AAPL', 'Bitcoin', 'Tesla')"),
      exactSymbol: z.boolean().optional().describe("If true, search by exact ticker symbol (e.g. 'AAPL') instead of free text"),
      page: z.number().optional().describe("Page number (default 1)"),
      pageSize: z.number().optional().describe("Results per page (default 20)"),
    },
    withErrorHandling(async (args) => {
      const params = new URLSearchParams();
      if (args.exactSymbol) {
        params.set("internalSymbolFull", args.query);
      } else {
        params.set("searchText", args.query);
      }
      if (args.page) params.set("pageNumber", String(args.page));
      params.set("pageSize", String(args.pageSize || 10));
      const data = await client.get<{ page: number; pageSize: number; totalItems: number; items: Record<string, unknown>[] }>(`/market-data/search?${params}`);

      // Extract instrument IDs from search results
      const ids = data.items
        .map((item) => item.instrumentId as number)
        .filter((id) => id !== undefined && id > 0);

      // Enrich with instrument metadata if we have IDs
      let enriched: Record<number, Record<string, unknown>> = {};
      if (ids.length > 0) {
        try {
          const meta = await client.get<{ instrumentDisplayDatas: Record<string, unknown>[] }>(
            `/market-data/instruments?instrumentIds=${ids.join(",")}`
          );
          for (const inst of meta.instrumentDisplayDatas || []) {
            enriched[inst.instrumentID as number] = inst;
          }
        } catch {
          // If metadata fetch fails, continue with IDs only
        }
      }

      const result = {
        page: data.page,
        pageSize: data.pageSize,
        totalItems: data.totalItems,
        items: data.items.map((item) => {
          const id = item.instrumentId as number;
          const meta = enriched[id];
          return {
            instrumentId: id,
            symbol: meta?.symbolFull ?? item.internalSymbolFull,
            displayName: meta?.instrumentDisplayName ?? item.displayName,
            instrumentTypeId: meta?.instrumentTypeID ?? item.instrumentTypeId,
            exchangeId: meta?.exchangeID ?? item.exchangeId,
          };
        }),
      };
      return formatToolResponse(result);
    })
  );

  // 2. get_instruments
  server.tool(
    "get_instruments",
    "Get details for one or more instruments by their IDs",
    {
      instrumentIds: z.array(z.number()).describe("Array of instrument IDs"),
    },
    withErrorHandling(async (args) => {
      const ids = args.instrumentIds.join(",");
      const data = await client.get(`/market-data/instruments?instrumentIds=${ids}`);
      return formatToolResponse(data);
    })
  );

  // 3. get_instrument_types
  server.tool(
    "get_instrument_types",
    "Get all available instrument types (stocks, crypto, ETFs, etc.)",
    {},
    withErrorHandling(async () => {
      const data = await client.get("/market-data/instrument-types");
      return formatToolResponse(data);
    })
  );

  // 4. get_industries
  server.tool(
    "get_industries",
    "Get all available industry classifications for instruments",
    {},
    withErrorHandling(async () => {
      const data = await client.get("/market-data/stocks-industries");
      return formatToolResponse(data);
    })
  );

  // 5. get_exchanges
  server.tool(
    "get_exchanges",
    "Get all available stock exchanges",
    {},
    withErrorHandling(async () => {
      const data = await client.get("/market-data/exchanges");
      return formatToolResponse(data);
    })
  );

  // 6. get_candles
  server.tool(
    "get_candles",
    "Get OHLCV candle data for an instrument",
    {
      instrumentId: z.number().describe("Instrument ID"),
      period: z.enum(["OneMinute", "FiveMinutes", "TenMinutes", "FifteenMinutes", "ThirtyMinutes", "OneHour", "FourHours", "OneDay", "OneWeek"]).describe("Candle period"),
      count: z.number().optional().describe("Number of candles to return (max 1000, default 10)"),
      direction: z.enum(["asc", "desc"]).optional().describe("Sort direction: 'asc' (oldest first) or 'desc' (newest first). Default: desc"),
    },
    withErrorHandling(async (args) => {
      const direction = args.direction || "desc";
      const count = args.count || 10;
      const data = await client.get(
        `/market-data/instruments/${args.instrumentId}/history/candles/${direction}/${args.period}/${count}`
      );
      return formatToolResponse(data);
    })
  );

  // 7. get_closing_prices
  server.tool(
    "get_closing_prices",
    "Get historical closing prices for all instruments",
    {},
    withErrorHandling(async () => {
      const data = await client.get("/market-data/instruments/history/closing-price");
      return formatToolResponse(data);
    })
  );

  // 8. get_rates
  server.tool(
    "get_rates",
    "Get live bid/ask rates for instruments",
    {
      instrumentIds: z.array(z.number()).describe("Array of instrument IDs (max 100)"),
    },
    withErrorHandling(async (args) => {
      const ids = args.instrumentIds.join(",");
      const data = await client.get(`/market-data/instruments/rates?instrumentIds=${ids}`);
      return formatToolResponse(data);
    })
  );
}
