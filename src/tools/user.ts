import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { EtoroClient } from "../client/etoro-client.js";
import { formatToolResponse, withErrorHandling } from "../utils/errors.js";

export function registerUserTools(server: McpServer, client: EtoroClient): void {
  // 1. get_user_profile
  server.tool(
    "get_user_profile",
    "Get a user's public profile information",
    {
      username: z.string().describe("eToro username"),
    },
    withErrorHandling(async (args) => {
      const data = await client.get(`/user-info/people?usernames=${args.username}`);
      return formatToolResponse(data);
    })
  );

  // 2. get_user_performance
  server.tool(
    "get_user_performance",
    "Get a user's trading performance summary (returns, risk score, etc.)",
    {
      username: z.string().describe("eToro username"),
    },
    withErrorHandling(async (args) => {
      const data = await client.get(`/user-info/people/${args.username}/gain`);
      return formatToolResponse(data);
    })
  );

  // 3. get_user_performance_granular
  server.tool(
    "get_user_performance_granular",
    "Get detailed/granular performance data for a user over a period",
    {
      username: z.string().describe("eToro username"),
      period: z.enum(["CurrMonth", "CurrQuarter", "CurrYear", "LastYear", "LastTwoYears", "OneMonthAgo", "TwoMonthsAgo", "ThreeMonthsAgo", "SixMonthsAgo", "OneYearAgo"]).describe("Performance period"),
    },
    withErrorHandling(async (args) => {
      const data = await client.get(
        `/user-info/people/${args.username}/gain?period=${args.period}`
      );
      return formatToolResponse(data);
    })
  );

  // 4. get_user_trades
  server.tool(
    "get_user_trades",
    "Get a user's trade info for a specific period",
    {
      username: z.string().describe("eToro username"),
      period: z.enum(["CurrMonth", "CurrQuarter", "CurrYear", "LastYear", "LastTwoYears", "OneMonthAgo", "TwoMonthsAgo", "ThreeMonthsAgo", "SixMonthsAgo", "OneYearAgo"]).describe("Period to retrieve trades for"),
    },
    withErrorHandling(async (args) => {
      const data = await client.get(
        `/user-info/people/${args.username}/tradeinfo?period=${args.period}`
      );
      return formatToolResponse(data);
    })
  );

  // 5. get_user_portfolio
  server.tool(
    "get_user_portfolio",
    "Get a user's live public portfolio holdings",
    {
      username: z.string().describe("eToro username"),
    },
    withErrorHandling(async (args) => {
      const data = await client.get(`/user-info/people/${args.username}/portfolio/live`);
      return formatToolResponse(data);
    })
  );

  // 6. discover_users
  server.tool(
    "discover_users",
    "Discover popular investors and traders on eToro (filterable)",
    {
      period: z.enum(["CurrMonth", "CurrQuarter", "CurrYear", "LastYear", "LastTwoYears", "OneMonthAgo", "TwoMonthsAgo", "ThreeMonthsAgo", "SixMonthsAgo", "OneYearAgo"]).describe("Performance period to filter by"),
      gainMin: z.number().optional().describe("Minimum gain percentage"),
      gainMax: z.number().optional().describe("Maximum gain percentage"),
      maxDailyRiskScoreMax: z.number().optional().describe("Max daily risk score"),
      maxMonthlyRiskScoreMax: z.number().optional().describe("Max monthly risk score"),
      popularInvestor: z.boolean().optional().describe("Filter to popular investors only"),
      page: z.number().optional().describe("Page number (default 1)"),
      pageSize: z.number().optional().describe("Results per page (default 20)"),
    },
    withErrorHandling(async (args) => {
      const params = new URLSearchParams({ period: args.period });
      if (args.gainMin !== undefined) params.set("gainMin", String(args.gainMin));
      if (args.gainMax !== undefined) params.set("gainMax", String(args.gainMax));
      if (args.maxDailyRiskScoreMax !== undefined) params.set("maxDailyRiskScoreMax", String(args.maxDailyRiskScoreMax));
      if (args.maxMonthlyRiskScoreMax !== undefined) params.set("maxMonthlyRiskScoreMax", String(args.maxMonthlyRiskScoreMax));
      if (args.popularInvestor !== undefined) params.set("popularInvestor", String(args.popularInvestor));
      if (args.page) params.set("page", String(args.page));
      if (args.pageSize) params.set("pageSize", String(args.pageSize));
      const data = await client.get(`/user-info/people/search?${params}`);
      return formatToolResponse(data);
    })
  );
}
