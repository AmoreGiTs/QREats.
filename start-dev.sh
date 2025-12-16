#!/bin/bash

# Clear any existing auth sessions
rm -f /tmp/next-auth-*

# Start dev server with clean auth state
NEXT_AUTH_DEBUG=1 \
NEXT_PUBLIC_DEBUG_AUTH=1 \
npm run dev
