---
name: spool
description: Threads CLI - Post, read, and search on Meta's Threads from the terminal.
homepage: https://github.com/zizi-cat/spool
metadata: {"clawdbot":{"emoji":"🧵","requires":{"bins":["spool"]},"install":[{"id":"npm","kind":"npm","package":"spool-cli","bins":["spool"],"label":"Install spool (npm)"}]}}
---

# spool

Use `spool` to post, read, and search on Meta's Threads.

## Setup

1. Create a Meta app at https://developers.facebook.com/apps/
2. Add the Threads API product
3. Set OAuth redirect URI: `http://localhost:8899/callback`
4. Run `spool login` and enter your Client ID & Secret

## Quick Commands

```bash
# Auth
spool login
spool logout

# Profile
spool whoami

# Post
spool post "Hello from the terminal! 🧵"
spool post "Check this!" --image https://example.com/img.jpg

# Reply
spool reply <id-or-url> "Nice thread!"

# Read
spool read <id-or-url>

# List your posts
spool posts
spool posts -n 20

# Search
spool search "AI"
spool search "#coding" --tag
```

## Required Scopes

- `threads_basic` - Profile access
- `threads_content_publish` - Create posts
- `threads_manage_replies` - Manage replies
- `threads_read_replies` - Read replies
- `threads_manage_insights` - Analytics

## Environment Variables

```bash
export THREADS_CLIENT_ID="your-client-id"
export THREADS_CLIENT_SECRET="your-client-secret"
```

## Tips

- Confirm with user before posting
- Post IDs can be extracted from Threads URLs
- Max 500 characters per post
