# Greeting Cards Backend

A Telegram bot and REST API for creating and managing digital greeting cards. Built with [Hono](https://hono.dev/) and deployed on [Cloudflare Workers](https://workers.cloudflare.com/).

## Architecture

```mermaid
flowchart TB
    subgraph Clients
        TG[Telegram]
        FE[Frontend App]
    end

    subgraph Cloudflare Workers
        subgraph Routes
            WH["/webhook"]
            API["/api"]
        end

        subgraph Bot
            DISP[Dispatcher]
            CMD[Commands]
            CONV[Conversations]
            STATE[State Manager]
            TG_CLIENT[Telegram Client]
        end
    end

    subgraph Storage
        D1[(D1 Database)]
        KV[(KV Namespace)]
    end

    TG -->|Webhook POST| WH
    FE -->|REST GET| API

    WH --> DISP
    DISP --> CMD
    DISP --> CONV
    CONV <--> STATE
    STATE <--> KV
    CMD --> TG_CLIENT
    CONV --> TG_CLIENT
    TG_CLIENT -->|Bot API| TG

    API <-->|Read/Cache| KV
    API <-->|Query| D1
    CMD <-->|CRUD| D1
    CONV <-->|CRUD| D1
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Bot token from [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_WEBHOOK_SECRET` | Secret token for webhook verification |
| `TELEGRAM_CHAT_ID` | Allowed chat ID for bot interactions |
| `FRONTEND_URL` | Frontend origin for CORS (e.g., `https://cards.example.com`) |

## Bindings

| Binding | Type | Description |
|---------|------|-------------|
| `CARD_DB` | D1 Database | Stores greeting card records |
| `CARD_CACHE` | KV Namespace | Caches cards and conversation state |

### KV Key Patterns

| Pattern | TTL | Description |
|---------|-----|-------------|
| `card:<id>` | 1 hour | Cached card data |
| `chat:<chat_id>:state` | 1 hour | Conversation state for Telegram chat |

## Data Model

```mermaid
erDiagram
    CARD {
        string id PK "10-char nanoid"
        string recipient
        string sender
        string occasion "birthday | general"
        string title
        string thai_content "optional"
        string english_content "optional"
        int is_active "0 or 1"
        string created_at
        string updated_at
    }
```

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message |
| `/help` | Show available commands |
| `/create` | Start card creation flow |
| `/list` | List all active cards |
| `/view <id>` | View a specific card |
| `/update <id>` | Update a card |
| `/delete <id>` | Soft-delete a card |
| `/cancel` | Cancel current operation |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check and API info |
| `GET` | `/api/cards/:id` | Retrieve a card by ID |

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/)
- [Cloudflare account](https://dash.cloudflare.com/)

## Setup

1. **Install dependencies**

   ```sh
   pnpm install
   ```

2. **Configure environment**

   ```sh
   cp .env.example .env
   ```

   Edit `.env` with your values.

3. **Generate types**

   ```sh
   pnpm run cf-typegen
   ```

## Development

```sh
pnpm run dev
```

## Deployment

```sh
pnpm run deploy
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Start local development server |
| `pnpm run deploy` | Deploy to Cloudflare Workers |
| `pnpm run lint` | Run Biome linter with auto-fix |
| `pnpm run cf-typegen` | Generate TypeScript types from wrangler config |

## License

[MIT](LICENSE)
