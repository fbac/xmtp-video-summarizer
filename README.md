# YouTube SummarAIzer

An XMTP agent that automatically summarizes YouTube videos using AI. Built with [XMTP Agent SDK](https://www.npmjs.com/package/@xmtp/agent-sdk), it enables decentralized messaging interactions where users can share YouTube links and receive AI-generated summaries.

## Features

- **Automatic Link Detection** - Paste any YouTube URL and get an instant summary
- **Command Interface** - Use `/summary <URL>` for explicit requests or `/help` for assistance
- **Multi-Backend AI Support** - Choose from OpenAI, Anthropic (Claude), or Perplexity for summarization
- **Smart Caching** - Summaries are cached to avoid redundant API calls and reduce latency
- **Fun Facts** - Displays random facts while processing to keep users engaged

## How It Works

1. User sends a message containing a YouTube link via XMTP
2. The agent extracts the video ID and fetches the transcript
3. The transcript is sent to the configured AI backend for summarization
4. The summary is cached and returned to the user

## Supported AI Backends

| Backend    | Model (Default)                     | Environment Variable |
| ---------- | ----------------------------------- | -------------------- |
| OpenAI     | `gpt-4o-mini`                       | `OPENAI_API_KEY`     |
| Anthropic  | `claude-sonnet-4-20250514`          | `ANTHROPIC_API_KEY`  |
| Perplexity | `llama-3.1-sonar-small-128k-online` | `PERPLEXITY_API_KEY` |

The agent auto-detects which backend to use based on available API keys, or you can explicitly set `AI_BACKEND` to `openai`, `anthropic`, or `perplexity`.

## Configuration

Create a `.env` file in the project root with the following variables:

```bash
# XMTP Configuration (required)
XMTP_WALLET_KEY=0x...          # Ethereum wallet private key
XMTP_DB_ENCRYPTION_KEY=0x...   # Database encryption key
XMTP_ENV=production            # or 'dev' for testing

# AI Backend (at least one API key required)
AI_BACKEND=openai              # openai | anthropic | perplexity
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
PERPLEXITY_API_KEY=your-key

# Optional: Override default models
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_MODEL=claude-sonnet-4-20250514
PERPLEXITY_MODEL=llama-3.1-sonar-small-128k-online

# Optional: Cache TTL (default: 1 hour)
YOUTUBE_CACHE_TTL_MS=3600000
```

If you don't have XMTP credentials, generate test keys at https://xmtp.github.io/agent-sdk-starter/ (keys are generated locally in your browser).

## Local Development

Install dependencies and start the agent:

```bash
npm install
npm start
```

After a successful start, the agent will print its address. Open the test URL in the console and send a direct message with a YouTube link to receive a summary.

### GitHub Codespaces

This project includes a GitHub Codespaces configuration for development without local setup.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/xmtp/agent-sdk-starter)

After the environment starts:

```bash
npm start
```

## Deploy to Render

Render supports [Persistent Disks](https://render.com/docs/disks) and one-click deployments using the bundled `render.yaml` blueprint:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/xmtp/agent-sdk-starter)

Set your environment variables in the Render dashboard after deployment.

## Project Structure

```
src/
├── index.ts              # Agent entry point and message handlers
├── backends/             # AI backend implementations
│   ├── anthropic.ts      # Anthropic/Claude integration
│   ├── openai.ts         # OpenAI integration
│   ├── perplexity.ts     # Perplexity integration
│   └── factory.ts        # Backend auto-detection and creation
└── youtube/              # YouTube processing modules
    ├── processor.ts      # Main orchestration (cache → transcript → summarize)
    ├── transcript.ts     # YouTube transcript fetching
    ├── summarizer.ts     # Transcript summarization
    ├── cache.ts          # Summary caching layer
    ├── validator.ts      # YouTube URL validation and extraction
    └── facts.ts          # Random facts for loading states
```

## Usage Examples

Once the agent is running, interact with it via XMTP:

**Automatic summarization:**

```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

**Explicit command:**

```
/summary https://youtu.be/dQw4w9WgXcQ
```

**Get help:**

```
/help
```

## Tech Stack

- [XMTP Agent SDK](https://www.npmjs.com/package/@xmtp/agent-sdk) - Decentralized messaging
- [OpenAI SDK](https://www.npmjs.com/package/openai) - OpenAI/Perplexity API client
- [Anthropic SDK](https://www.npmjs.com/package/@anthropic-ai/sdk) - Claude API client
- [youtube-transcript-plus](https://www.npmjs.com/package/youtube-transcript-plus) - YouTube transcript extraction
- TypeScript + tsx - Development and runtime

## Support

Chat with `xmtp-docs.eth` on [XMTP.chat](http://xmtp.chat/production/dm/xmtp-docs.eth) if you need help while developing with XMTP.

## License

MIT
