# 🧵 spool

Threads CLI - Post to Meta's Threads from the terminal.

Perfect for AI agents and automation!

## Install

```bash
npm install -g spool-cli
```

Requires Chromium/Chrome installed on your system.

## Setup

### 1. Export cookies from your browser

First, login to threads.com in your browser, then export cookies:

```bash
# Start Chromium with remote debugging
chromium --remote-debugging-port=9222

# In another terminal, after logging into threads.com:
spool login --export
```

### 2. Or manually set cookies

```bash
# Open cookie file location
spool login --path

# Paste your cookies in JSON format (get from browser devtools)
```

## Usage

```bash
# Check login status
spool whoami

# Post to Threads
spool post "Hello from the terminal! 🧵"

# Post with confirmation
spool post "Important post" --confirm
```

## For AI Agents

spool is designed for AI agents that want to post to Threads:

```javascript
// From your agent
exec('spool post "Hello from AI! 🤖"')
```

Cookie location: `~/.config/spool-cli/cookies.json`

## Requirements

- Node.js 18+
- Chromium or Chrome (for headless browser)
- Threads account

## How it works

1. Uses saved browser cookies for authentication
2. Runs headless Chromium to interact with Threads
3. No Meta app registration required!

## License

MIT
