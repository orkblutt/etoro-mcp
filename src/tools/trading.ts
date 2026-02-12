import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { EtoroClient } from "../client/etoro-client.js";
import { formatToolResponse, withErrorHandling } from "../utils/errors.js";

interface PortfolioResponse {
  clientPortfolio: {
    credit: number;
    bonusCredit: number;
    positions: Array<Record<string, unknown>>;
    orders: unknown[];
    stockOrders: unknown[];
    entryOrders: unknown[];
    ordersForOpen: unknown[];
    ordersForClose: unknown[];
    mirrors: unknown[];
  };
}

function trimPortfolio(data: PortfolioResponse) {
  const p = data.clientPortfolio;
  return {
    credit: p.credit,
    bonusCredit: p.bonusCredit,
    positionCount: p.positions.length,
    positions: p.positions.map((pos) => ({
      positionID: pos.positionID,
      instrumentID: pos.instrumentID,
      isBuy: pos.isBuy,
      amount: pos.amount,
      units: pos.units,
      leverage: pos.leverage,
      openRate: pos.openRate,
      openDateTime: pos.openDateTime,
      stopLossRate: pos.stopLossRate,
      takeProfitRate: pos.takeProfitRate,
    })),
    pendingOrders: [
      ...p.orders || [],
      ...p.stockOrders || [],
      ...p.entryOrders || [],
      ...p.ordersForOpen || [],
    ],
  };
}

export function registerTradingTools(server: McpServer, client: EtoroClient): void {
  // 1. open_position_by_amount
  server.tool(
    "open_position_by_amount",
    "Open a new position by specifying the investment amount in USD",
    {
      instrumentId: z.number().describe("Instrument ID to trade"),
      amount: z.number().describe("Investment amount in USD"),
      isBuy: z.boolean().describe("true = Buy/Long, false = Sell/Short"),
      leverage: z.number().optional().describe("Leverage multiplier (e.g. 1, 2, 5, 10)"),
      stopLossRate: z.number().optional().describe("Stop loss price"),
      takeProfitRate: z.number().optional().describe("Take profit price"),
    },
    withErrorHandling(async (args) => {
      const body: Record<string, unknown> = {
        InstrumentId: args.instrumentId,
        Amount: args.amount,
        IsBuy: args.isBuy,
      };
      if (args.leverage !== undefined) body.Leverage = args.leverage;
      if (args.stopLossRate !== undefined) body.StopLossRate = args.stopLossRate;
      if (args.takeProfitRate !== undefined) body.TakeProfitRate = args.takeProfitRate;

      const path = client.executionPath("/market-open-orders/by-amount");
      const data = await client.post(path, body);
      return formatToolResponse(data);
    })
  );

  // 2. open_position_by_units
  server.tool(
    "open_position_by_units",
    "Open a new position by specifying the number of units (shares, coins, etc.)",
    {
      instrumentId: z.number().describe("Instrument ID to trade"),
      units: z.number().describe("Number of units to buy/sell"),
      isBuy: z.boolean().describe("true = Buy/Long, false = Sell/Short"),
      leverage: z.number().optional().describe("Leverage multiplier"),
      stopLossRate: z.number().optional().describe("Stop loss price"),
      takeProfitRate: z.number().optional().describe("Take profit price"),
    },
    withErrorHandling(async (args) => {
      const body: Record<string, unknown> = {
        InstrumentId: args.instrumentId,
        Units: args.units,
        IsBuy: args.isBuy,
      };
      if (args.leverage !== undefined) body.Leverage = args.leverage;
      if (args.stopLossRate !== undefined) body.StopLossRate = args.stopLossRate;
      if (args.takeProfitRate !== undefined) body.TakeProfitRate = args.takeProfitRate;

      const path = client.executionPath("/market-open-orders/by-units");
      const data = await client.post(path, body);
      return formatToolResponse(data);
    })
  );

  // 3. close_position
  server.tool(
    "close_position",
    "Close an open position by its position ID",
    {
      positionId: z.number().describe("The position ID to close"),
    },
    withErrorHandling(async (args) => {
      const path = client.executionPath(`/market-close-orders/positions/${args.positionId}`);
      const data = await client.post(path, { UnitsToDeduct: null });
      return formatToolResponse(data);
    })
  );

  // 4. place_limit_order
  server.tool(
    "place_limit_order",
    "Place a limit/entry order at a specified price",
    {
      instrumentId: z.number().describe("Instrument ID"),
      amount: z.number().describe("Investment amount in USD"),
      isBuy: z.boolean().describe("true = Buy/Long, false = Sell/Short"),
      rate: z.number().describe("Limit price at which the order should execute"),
      leverage: z.number().optional().describe("Leverage multiplier"),
      stopLossRate: z.number().optional().describe("Stop loss price"),
      takeProfitRate: z.number().optional().describe("Take profit price"),
    },
    withErrorHandling(async (args) => {
      const body: Record<string, unknown> = {
        InstrumentId: args.instrumentId,
        Amount: args.amount,
        IsBuy: args.isBuy,
        Rate: args.rate,
      };
      if (args.leverage !== undefined) body.Leverage = args.leverage;
      if (args.stopLossRate !== undefined) body.StopLossRate = args.stopLossRate;
      if (args.takeProfitRate !== undefined) body.TakeProfitRate = args.takeProfitRate;

      const path = client.executionPath("/limit-orders");
      const data = await client.post(path, body);
      return formatToolResponse(data);
    })
  );

  // 5. cancel_order
  server.tool(
    "cancel_order",
    "Cancel a pending order by its order ID",
    {
      orderId: z.number().describe("The order ID to cancel"),
    },
    withErrorHandling(async (args) => {
      const path = client.executionPath(`/market-open-orders/${args.orderId}`);
      const data = await client.delete(path);
      return formatToolResponse(data);
    })
  );

  // 6. get_orders
  server.tool(
    "get_orders",
    "Get all pending orders for the current user",
    {},
    withErrorHandling(async () => {
      const path = client.infoPath("/portfolio");
      const data = await client.get<PortfolioResponse>(path);
      const trimmed = trimPortfolio(data);
      return formatToolResponse(trimmed.pendingOrders);
    })
  );

  // 7. get_portfolio
  server.tool(
    "get_portfolio",
    "Get the current user's portfolio (all open positions)",
    {
      page: z.number().optional().describe("Page number (default 1)"),
      pageSize: z.number().optional().describe("Positions per page (default 50)"),
    },
    withErrorHandling(async (args) => {
      const path = client.infoPath("/portfolio");
      const data = await client.get<PortfolioResponse>(path);
      const trimmed = trimPortfolio(data);
      const page = args.page || 1;
      const size = args.pageSize || 50;
      const start = (page - 1) * size;
      const paged = trimmed.positions.slice(start, start + size);
      return formatToolResponse({
        credit: trimmed.credit,
        bonusCredit: trimmed.bonusCredit,
        positionCount: trimmed.positionCount,
        page,
        pageSize: size,
        totalPages: Math.ceil(trimmed.positionCount / size),
        positions: paged,
        pendingOrders: trimmed.pendingOrders,
      });
    })
  );
}
