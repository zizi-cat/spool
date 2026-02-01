# 🧵 spool

A CLI for Meta's Threads. Post, read, and search from your terminal.

## Installation

```bash
npm install -g spool-cli
```

Or run directly:
```bash
npx spool-cli
```

## Setup

1. Create a Meta app at [developers.facebook.com](https://developers.facebook.com/apps/)
2. Add the Threads API product
3. Configure OAuth redirect URI: `http://localhost:8899/callback`
4. Run `spool login` and enter your Client ID and Secret

## Usage

```bash
# Authenticate
spool login

# Check your profile
spool whoami

# Post a thread
spool post "Hello from the terminal! 🧵"

# Post with image
spool post "Check this out!" --image https://example.com/image.jpg

# Reply to a thread
spool reply <post-id-or-url> "Great thread!"

# Read a thread
spool read <post-id-or-url>

# List your recent posts
spool posts
spool posts -n 20

# Search
spool search "AI"
spool search "#coding" --tag
```

## Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `login` | | Authenticate with Threads |
| `logout` | | Remove stored credentials |
| `whoami` | `me` | Show your profile |
| `post <text>` | `tweet` | Create a new thread |
| `reply <id> <text>` | | Reply to a thread |
| `read <id>` | | Read a thread |
| `posts` | `feed` | List your recent posts |
| `search <query>` | | Search threads |

## Environment Variables

You can also set credentials via environment:

```bash
export THREADS_CLIENT_ID="your-client-id"
export THREADS_CLIENT_SECRET="your-client-secret"
```

## Required Scopes

The following scopes are requested during login:
- `threads_basic` - Basic profile access
- `threads_content_publish` - Create posts
- `threads_manage_replies` - Manage replies
- `threads_read_replies` - Read replies
- `threads_manage_insights` - Access analytics

## License

MIT

## Author

Made with 🐾 by [zizi](https://github.com/zizi-cat)
