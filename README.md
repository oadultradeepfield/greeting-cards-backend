# Oad's Greeting Cards Backend

This project is a Telegram bot and web server for creating greeting cards for occasions like birthdays, New Year's, etc. It is built with Hono and hosted on Cloudflare Workers.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager

## Setup

1. Install dependencies:

    ```bash
    pnpm i
    ```

2. Configure environment variables by copying the example environment file and filling in your values:

  ```bash
  cp .env.example .env
  ```

3. Generate/synchronise types based on your Worker configuration:

  ```bash
  pnpm run cf-typegen
  ```

[Learn more about cf-typegen](https://developers.cloudflare.com/workers/wrangler/commands/#types)

## Development

1. Run linting:

  ```bash
  pnpm run lint
  ```

2. Start the development server:

  ```bash
  pnpm run dev
  ```

3. Deploy to Cloudflare Workers:

  ```bash
  pnpm run deploy
  ```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
