// Import .env
import 'dotenv-defaults/config.js';
// Import Agent SDK
import {Agent, AgentError, AgentMiddleware} from '@xmtp/agent-sdk';
import {CommandRouter} from '@xmtp/agent-sdk/middleware';
import {summarize} from './youtube/index.js';

const agent = await Agent.createFromEnv({
  appVersion: '@xmtp/agent-sdk-starter',
});

const router = new CommandRouter();

// /help command
router.command('/help', async ctx => {
  await ctx.conversation.sendMarkdown(`**YouTube SummarAIzer Bot**

Commands:
- \`/help\` - Show this message
- \`/summary <YouTube URL>\` - Summarize a YouTube video

Or just paste any YouTube link and I'll summarize it automatically!`);
});

// /summary command
router.command('/summary', async ctx => {
  const args = ctx.message.content.replace(/^\/summary\s*/i, '').trim();

  if (!args) {
    await ctx.conversation.sendMarkdown(
      '**Usage:** `/summary <YouTube URL>`\n\nExample: `/summary https://www.youtube.com/watch?v=dQw4w9WgXcQ`'
    );
    return;
  }

  const result = await summarize(args, ctx.conversation, {maxLinks: 1});

  if (result.found === 0) {
    await ctx.conversation.sendMarkdown(
      '**Error:** No valid YouTube URL found.\n\nPlease provide a valid YouTube link.'
    );
  }
});

// Error handler
agent.on('unhandledError', (error: unknown) => {
  if (error instanceof AgentError) {
    console.log(`Caught error ID "${error.code}"`, error);
    console.log('Original error', error.cause);
  } else {
    console.log(`Caught error`, error);
  }
});

// On first DM, send welcome message
agent.on('dm', async ctx => {
  await ctx.conversation.sendMarkdown(`**Welcome to YouTube SummarAIzer!**

I can summarize YouTube videos for you:
- Just paste any YouTube link and I'll summarize it
- Or use \`/summary <URL>\` for explicit requests
- Type \`/help\` for more info`);
});

/**
 * Middleware that auto-detects YouTube links in messages,
 * fetches transcripts, summarizes them, and sends the summaries.
 */
const youtubeDetector: AgentMiddleware = async (ctx, next) => {
  if (!ctx.isText()) {
    await next();
    return;
  }

  await summarize(ctx.message.content, ctx.conversation);

  await next();
};

// Handle /help and /summary commands
agent.use(router.middleware());

// Middleware to auto-detect YouTube links in a conversation
agent.use(youtubeDetector);

await agent.start();

console.log('Agent has started.');
console.log('Chat with me at', agent.address);
