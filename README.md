# Oad's Greeting Cards Backend

This project is a Telegram bot and web server for creating greeting cards for occasions like birthdays, New Year's, etc. It is built with Hono and hosted on Cloudflare Workers.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager

## Setup

1. Install dependencies:

```txt
pnpm i
```

2. Configure environment variables:

Copy the example environment file and fill in your values:

```txt
cp .env.example .env
```

Required environment variables:

```txt
TELEGRAM_CHAT_ID=
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
```

3. Generate/synchronise types based on your Worker configuration:

```txt
pnpm run cf-typegen
```

[Learn more about cf-typegen](https://developers.cloudflare.com/workers/wrangler/commands/#types)

## Development

1. Run linting:

```txt
pnpm run lint
```

2. Start the development server:

```txt
pnpm run dev
```

3. Deploy to Cloudflare Workers:

```txt
pnpm run deploy
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
