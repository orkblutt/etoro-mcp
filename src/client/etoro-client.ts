import { randomUUID } from "node:crypto";
import { Config } from "../config.js";
import { EtoroApiError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const BASE_URL = "https://public-api.etoro.com/api/v1";

export class EtoroClient {
  constructor(private config: Config) {}

  get tradingMode() {
    return this.config.tradingMode;
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-request-id": randomUUID(),
    };
    if (this.config.userKey) {
      headers["x-api-key"] = this.config.userKey;
    }
    if (this.config.apiKey) {
      headers["x-user-key"] = this.config.apiKey;
    }
    return headers;
  }

  /**
   * Build trading execution path with demo/real routing.
   * e.g. executionPath("/market-open-orders/by-amount") →
   *   demo: "/trading/execution/demo/market-open-orders/by-amount"
   *   real: "/trading/execution/market-open-orders/by-amount"
   */
  executionPath(subPath: string): string {
    if (this.config.tradingMode === "demo") {
      return `/trading/execution/demo${subPath}`;
    }
    return `/trading/execution${subPath}`;
  }

  /**
   * Build trading info path with demo/real routing.
   * e.g. infoPath("/portfolio") →
   *   demo: "/trading/info/demo/portfolio"
   *   real: "/trading/info/portfolio"
   */
  infoPath(subPath: string): string {
    if (this.config.tradingMode === "demo") {
      return `/trading/info/demo${subPath}`;
    }
    return `/trading/info${subPath}`;
  }

  async request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const headers = { ...this.buildHeaders(), ...(options.headers as Record<string, string> || {}) };

    logger.debug(`${options.method || "GET"} ${url}`);

    const response = await fetch(url, { ...options, headers });

    const text = await response.text();

    if (!response.ok) {
      let body: unknown = text;
      try {
        body = JSON.parse(text);
      } catch { /* keep as raw text */ }
      throw new EtoroApiError(
        `Request failed: ${response.status} ${response.statusText}`,
        response.status,
        body
      );
    }

    if (!text) return undefined as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  }

  async get<T = unknown>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" });
  }

  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}
