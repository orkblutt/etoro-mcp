/**
 * Logger that writes to stderr only — stdout is reserved for MCP JSON-RPC.
 */
export const logger = {
  info: (...args: unknown[]) => console.error("[INFO]", ...args),
  warn: (...args: unknown[]) => console.error("[WARN]", ...args),
  error: (...args: unknown[]) => console.error("[ERROR]", ...args),
  debug: (...args: unknown[]) => {
    if (process.env.DEBUG) {
      console.error("[DEBUG]", ...args);
    }
  },
};
