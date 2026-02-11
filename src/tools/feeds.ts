import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { EtoroClient } from "../client/etoro-client.js";
import { formatToolResponse, withErrorHandling } from "../utils/errors.js";

export function registerFeedsTools(server: McpServer, client: EtoroClient): void {
  // 1. get_instrument_feed
  server.tool(
    "get_instrument_feed",
    "Get the social feed for a specific instrument (posts, discussions)",
    {
      instrumentId: z.number().describe("Instrument ID"),
      take: z.number().optional().describe("Number of posts to retrieve (default 20, max 100)"),
      offset: z.number().optional().describe("Number of posts to skip (default 0)"),
    },
    withErrorHandling(async (args) => {
      const params = new URLSearchParams();
      if (args.take) params.set("take", String(args.take));
      if (args.offset) params.set("offset", String(args.offset));
      const query = params.toString() ? `?${params}` : "";
      const data = await client.get(`/feeds/instrument/${args.instrumentId}${query}`);
      return formatToolResponse(data);
    })
  );

  // 2. get_user_feed
  server.tool(
    "get_user_feed",
    "Get the social feed for a specific user",
    {
      username: z.string().describe("eToro username"),
      take: z.number().optional().describe("Number of posts to retrieve (default 20, max 100)"),
      offset: z.number().optional().describe("Number of posts to skip (default 0)"),
    },
    withErrorHandling(async (args) => {
      const params = new URLSearchParams();
      if (args.take) params.set("take", String(args.take));
      if (args.offset) params.set("offset", String(args.offset));
      const query = params.toString() ? `?${params}` : "";
      const data = await client.get(`/feeds/user/${args.username}${query}`);
      return formatToolResponse(data);
    })
  );

  // 3. create_post
  server.tool(
    "create_post",
    "Create a new post on the eToro social feed",
    {
      content: z.string().describe("Post content/text"),
      instrumentId: z.number().optional().describe("Optional instrument ID to tag"),
    },
    withErrorHandling(async (args) => {
      const body: Record<string, unknown> = { message: args.content };
      if (args.instrumentId !== undefined) {
        body.tags = { tags: [{ name: "instrument", id: String(args.instrumentId) }] };
      }
      const data = await client.post("/feeds/post", body);
      return formatToolResponse(data);
    })
  );

  // 4. create_comment
  server.tool(
    "create_comment",
    "Add a comment to an existing post on the eToro social feed",
    {
      postId: z.string().describe("ID of the post to comment on"),
      content: z.string().describe("Comment content/text"),
    },
    withErrorHandling(async (args) => {
      const data = await client.post(`/reactions/${args.postId}/comment`, {
        content: args.content,
      });
      return formatToolResponse(data);
    })
  );
}
