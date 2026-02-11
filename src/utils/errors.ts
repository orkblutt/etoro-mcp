import { logger } from "./logger.js";

export class EtoroApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseBody?: unknown
  ) {
    super(message);
    this.name = "EtoroApiError";
  }
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export function formatToolResponse(data: unknown): { content: Array<{ type: "text"; text: string }> } {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

export function formatErrorResponse(error: unknown): { content: Array<{ type: "text"; text: string }>; isError: true } {
  let message: string;

  if (error instanceof EtoroApiError) {
    message = `eToro API Error (${error.statusCode}): ${error.message}`;
    if (error.responseBody) {
      message += `\nDetails: ${JSON.stringify(error.responseBody, null, 2)}`;
    }
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = String(error);
  }

  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
}

type ToolHandler<T> = (args: T) => Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }>;

export function withErrorHandling<T>(fn: (args: T) => Promise<{ content: Array<{ type: "text"; text: string }> }>): ToolHandler<T> {
  return async (args: T) => {
    try {
      return await fn(args);
    } catch (error) {
      logger.error("Tool error:", error);
      return formatErrorResponse(error);
    }
  };
}
