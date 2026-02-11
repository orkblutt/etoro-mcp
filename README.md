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
