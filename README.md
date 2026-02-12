# eToro MCP Server

MCP server that wraps the [eToro public API](https://public-api.etoro.com/api/v1), exposing 34 tools for AI assistants (Claude Desktop, Cursor, Claude Code, etc.).

## Setup

### 1. Build

```bash
npm install
npm run build
```

### 2. Configure credentials

You need an eToro API key and user key. There are two ways to pass them:

#### Option A: Environment variables (recommended for Claude Code)

```bash
claude mcp add etoro-mcp \
  -e ETORO_API_KEY=your-api-key \
  -e ETORO_USER_KEY=your-user-key \
  -e ETORO_TRADING_MODE=demo \
  node "C:\Users\orkblutt\Documents\eToro-MCP\dist\index.js"
```

#### Option B: CLI arguments

```bash
claude mcp add etoro-mcp \
  node "C:\Users\orkblutt\Documents\eToro-MCP\dist\index.js" \
  -- --api-key your-api-key --user-key your-user-key --trading-mode demo
```

#### Option C: Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "etoro-mcp": {
      "command": "node",
      "args": ["C:\\Users\\orkblutt\\Documents\\eToro-MCP\\dist\\index.js"],
      "env": {
        "ETORO_API_KEY": "your-api-key",
        "ETORO_USER_KEY": "your-user-key",
        "ETORO_TRADING_MODE": "demo"
      }
    }
  }
}
```

### 3. Restart the MCP server

After changing config, restart the server:

- **Claude Code:** type `/mcp` and restart the server, or restart Claude Code
- **Claude Desktop:** restart the app

## Configuration

| Setting | Env var | CLI arg | Default |
|---|---|---|---|
| API Key | `ETORO_API_KEY` | `--api-key` | (none) |
| User Key | `ETORO_USER_KEY` | `--user-key` | (none) |
| Trading Mode | `ETORO_TRADING_MODE` | `--trading-mode` | `demo` |

**Trading mode:** `demo` routes trading calls through eToro's demo/virtual account. Set to `real` for live trading.

## Tools (34 total)

### Market Data (8)
| Tool | Description |
|---|---|
| `search_instruments` | Search instruments by keyword (e.g. "AAPL", "Bitcoin") |
| `get_instruments` | Get instrument details by IDs |
| `get_instrument_types` | List all instrument types (stocks, crypto, ETFs…) |
| `get_industries` | List industry classifications |
| `get_exchanges` | List stock exchanges |
| `get_candles` | Get OHLCV candle data |
| `get_closing_prices` | Get closing prices for instruments |
| `get_rates` | Get live bid/ask rates |

### Trading (7)
| Tool | Description |
|---|---|
| `open_position_by_amount` | Open position by USD amount |
| `open_position_by_units` | Open position by unit count |
| `close_position` | Close an open position |
| `place_limit_order` | Place a limit/entry order |
| `cancel_order` | Cancel a pending order |
| `get_orders` | List all pending orders |
| `get_portfolio` | Get all open positions |

### Social Feeds (4)
| Tool | Description |
|---|---|
| `get_instrument_feed` | Get social feed for an instrument |
| `get_user_feed` | Get social feed for a user |
| `create_post` | Create a social feed post |
| `create_comment` | Comment on a post |

### Watchlists (9)
| Tool | Description |
|---|---|
| `get_watchlists` | List your watchlists |
| `create_watchlist` | Create a watchlist |
| `delete_watchlist` | Delete a watchlist |
| `rename_watchlist` | Rename a watchlist |
| `add_watchlist_items` | Add instruments to a watchlist |
| `remove_watchlist_item` | Remove an instrument from a watchlist |
| `set_default_watchlist` | Set default watchlist |
| `get_curated_lists` | Get eToro's curated lists |
| `get_public_watchlists` | Browse public watchlists |

### User & Discovery (6)
| Tool | Description |
|---|---|
| `get_user_profile` | Get a user's public profile |
| `get_user_performance` | Get performance summary |
| `get_user_performance_granular` | Get detailed performance over a period |
| `get_user_trades` | Get trade history |
| `get_user_portfolio` | Get public portfolio holdings |
| `discover_users` | Discover popular investors (filterable) |

## Conversation Examples

Below are real examples of what you can do with an AI assistant connected to the eToro MCP server.

### Place a limit order

> **You:** Place a buy limit order for 5 SOL if it reaches $75

The assistant searches for the Solana instrument, fetches the current rate, and places the order:

> **Assistant:** Current SOL price is $78.21. I've placed a buy limit order for 5 SOL at $75 ($375 total) with a stop loss at $1. Order confirmed with token `cce5cf97-...`.

---

### DCA ladder based on technical analysis

> **You:** Can you place some DCA buy limit orders for ETH based on key support levels?

The assistant analyzes daily/weekly candle data, identifies support zones, and asks for your budget:

> **Assistant:** Based on the chart, here are the key support levels for ETH:
> - $1,750 — first support zone
> - $1,500 — strong horizontal support
> - $1,200 — macro support
> - $1,000 — psychological floor
>
> I've placed 4 limit orders:
> | Level | Amount | ~ETH |
> |-------|--------|------|
> | $1,750 | $1,000 | 0.57 |
> | $1,500 | $1,500 | 1.00 |
> | $1,200 | $2,000 | 1.67 |
> | $1,000 | $2,500 | 2.50 |

---

### Portfolio analysis and average entry price

> **You:** What's my average entry price on SOL including all my positions?

The assistant fetches your full portfolio, filters SOL positions, and calculates:

> **Assistant:** You have 27 SOL positions totaling **124.62 SOL** with an average entry of **$120.99**.
>
> Including your 4 pending limit orders (39.81 SOL), if all trigger your new average would be **$106.14** on 164.43 SOL.

---

### Market research and opinion

> **You:** What do you think about SUI?

The assistant combines on-chain data with web research:

> **Assistant:** SUI is trading at **$0.905**, down 75% from its October high of $3.70. Your 4 positions total 3,434 SUI at an average of $1.18 — currently -23%.
>
> **Key levels:** Support at $0.874 and $0.788 (flash crash low). Resistance at $1.00 and $1.10.
>
> **Catalysts:** SUI ETF applications under SEC review, SuiPlay0X1 gaming device launching Q3 2026. The $0.78-$0.85 zone is a strong accumulation area.

---

### Discover top traders

> **You:** Find me the best performing popular investors this year

The assistant uses the discovery tool with filters:

> **Assistant:** Here are the top popular investors for the current year, sorted by gain...

---

### Manage watchlists

> **You:** Create a watchlist called "AI Coins" and add SUI, NEAR, and TAO to it

The assistant creates the watchlist and adds the instruments:

> **Assistant:** Done! Created watchlist "AI Coins" and added:
> - SUI (Sui) — ID 100340
> - NEAR (Near Protocol) — ID 100337
> - TAO (Bittensor) — ID 100418

---

### Quick price check

> **You:** What's the current price of Bitcoin and Ethereum?

> **Assistant:** Live rates:
> - **BTC**: $68,503 (bid) / $68,520 (ask)
> - **ETH**: $1,801 (bid) / $1,803 (ask)
