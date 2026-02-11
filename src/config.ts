import { ConfigError } from "./utils/errors.js";
import { logger } from "./utils/logger.js";

export type TradingMode = "demo" | "real";

export interface Config {
  apiKey: string;
  userKey: string;
  tradingMode: TradingMode;
}

function parseCliArgs(): Partial<Config> {
  const args = process.argv.slice(2);
  const result: Partial<Config> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === "--api-key" && next) {
      result.apiKey = next;
      i++;
    } else if (arg === "--user-key" && next) {
      result.userKey = next;
      i++;
    } else if (arg === "--trading-mode" && next) {
      if (next !== "demo" && next !== "real") {
        throw new ConfigError(`Invalid trading mode: ${next}. Must be "demo" or "real".`);
      }
      result.tradingMode = next;
      i++;
    }
  }

  return result;
}

export function loadConfig(): Config {
  const cli = parseCliArgs();

  const apiKey = cli.apiKey || process.env.ETORO_API_KEY || "";
  const userKey = cli.userKey || process.env.ETORO_USER_KEY || "";
  const tradingModeRaw = cli.tradingMode || process.env.ETORO_TRADING_MODE || "demo";

  if (tradingModeRaw !== "demo" && tradingModeRaw !== "real") {
    throw new ConfigError(`Invalid ETORO_TRADING_MODE: ${tradingModeRaw}. Must be "demo" or "real".`);
  }

  const config: Config = {
    apiKey,
    userKey,
    tradingMode: tradingModeRaw,
  };

  logger.info(`Trading mode: ${config.tradingMode}`);
  if (!config.apiKey) {
    logger.warn("No API key configured. Set ETORO_API_KEY or pass --api-key.");
  }
  if (!config.userKey) {
    logger.warn("No user key configured. Set ETORO_USER_KEY or pass --user-key.");
  }

  return config;
}
